import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { User } from "../models/index.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validate: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, phone } = req.body;

    if ([fullName, email, username, password, phone].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        where: {
            [Op.or]: [{ username }, { email }, { phone }]
        }
    });

    if (existedUser) {
        throw new ApiError(409, "User with email, username or phone already exists");
    }

    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
        phone
    });

    const createdUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const sendLoginOTP = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        throw new ApiError(400, "Phone number is required");
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.update({
        otpCode: otp,
        otpExpiry: otpExpiry
    });

    // TODO: Send OTP via SMS service
    console.log(`OTP for ${phone}: ${otp}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully")
    );
});

const verifyOTPAndLogin = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        throw new ApiError(400, "Phone number and OTP are required");
    }

    const user = await User.findOne({ 
        where: { 
            phone,
            otpCode: otp,
            otpExpiry: { [Op.gt]: new Date() }
        }
    });

    if (!user) {
        throw new ApiError(401, "Invalid or expired OTP");
    }

    await user.update({
        otpCode: null,
        otpExpiry: null,
        phoneVerified: true
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

    const loggedInUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        where: {
            [Op.or]: [{ username }, { email }]
        }
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

    const loggedInUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.update(
        { refreshToken: null },
        { where: { id: req.user.id } }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findByPk(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user.id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});

export {
    registerUser,
    sendLoginOTP,
    verifyOTPAndLogin,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
};