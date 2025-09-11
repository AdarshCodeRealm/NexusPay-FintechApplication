import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { User } from "../models/index.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { sequelize } from "../db/index.js";

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
    console.log('Request body:', req.body); // Debug log
    const { phone, otp } = req.body;

    // More comprehensive validation
    if (!phone || phone.trim() === '') {
        throw new ApiError(400, "Phone number is required");
    }
    
    if (!otp || otp.trim() === '') {
        throw new ApiError(400, "OTP is required");
    }

    const user = await User.findOne({ 
        where: { 
            phone: phone.trim(),
            otpCode: otp.trim(),
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

const verifyOTPFor2FA = asyncHandler(async (req, res) => {
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

    // Clear OTP after successful verification
    await user.update({
        otpCode: null,
        otpExpiry: null,
        phoneVerified: true,
        lastLogin: new Date()
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
                "2FA verification successful, user logged in"
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

const loginWithPhone = asyncHandler(async (req, res) => {
    const requestId = req.requestId || `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    try {
        console.log(`[${requestId}] 🔍 loginWithPhone - Starting authentication process`);

        const { phone, password } = req.body;

        // Enhanced input validation
        if (!phone || phone.trim() === '') {
            console.log(`[${requestId}] ❌ Phone number missing or empty`);
            throw new ApiError(400, "Phone number is required");
        }
        
        if (!password || password.trim() === '') {
            console.log(`[${requestId}] ❌ Password missing or empty`);
            throw new ApiError(400, "Password is required");
        }

        // Validate phone number format
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.trim())) {
            console.log(`[${requestId}] ❌ Invalid phone format: ${phone}`);
            throw new ApiError(400, "Please provide a valid 10-digit phone number");
        }

        // Test database connection before proceeding
        console.log(`[${requestId}] 🔍 Testing database connection...`);
        try {
            await sequelize.authenticate();
            console.log(`[${requestId}] ✅ Database connection verified`);
        } catch (dbError) {
            console.error(`[${requestId}] ❌ Database connection failed:`, dbError);
            throw new ApiError(503, "Database service unavailable. Please try again later.");
        }

        // Search for user
        console.log(`[${requestId}] 🔍 Searching for user with phone: ${phone.substring(0, 3)}***${phone.substring(7)}`);
        let user;
        try {
            user = await User.findOne({
                where: { phone: phone.trim() }
            });
        } catch (queryError) {
            console.error(`[${requestId}] ❌ Database query error:`, {
                name: queryError.name,
                message: queryError.message,
                sql: queryError.sql || 'No SQL available'
            });
            throw new ApiError(500, "Database query failed. Please try again.");
        }

        if (!user) {
            console.log(`[${requestId}] ❌ No user found with phone: ${phone.substring(0, 3)}***${phone.substring(7)}`);
            throw new ApiError(404, "No user found with this phone number");
        }

        console.log(`[${requestId}] ✅ User found: ${user.fullName} (ID: ${user.id})`);

        // Verify password
        console.log(`[${requestId}] 🔍 Verifying password...`);
        let isPasswordValid;
        try {
            isPasswordValid = await user.isPasswordCorrect(password);
        } catch (passwordError) {
            console.error(`[${requestId}] ❌ Password verification error:`, passwordError);
            throw new ApiError(500, "Password verification failed. Please try again.");
        }

        if (!isPasswordValid) {
            console.log(`[${requestId}] ❌ Invalid password for user: ${user.id}`);
            throw new ApiError(401, "Invalid password");
        }

        console.log(`[${requestId}] ✅ Password verified successfully`);

        // Update last login
        console.log(`[${requestId}] 🔍 Updating last login...`);
        try {
            await user.update({ lastLogin: new Date() });
            console.log(`[${requestId}] ✅ Last login updated`);
        } catch (updateError) {
            console.warn(`[${requestId}] ⚠️ Failed to update last login (non-critical):`, updateError.message);
            // Don't fail the login for this non-critical operation
        }

        // Generate tokens
        console.log(`[${requestId}] 🔍 Generating authentication tokens...`);
        let accessToken, refreshToken;
        try {
            const tokens = await generateAccessAndRefreshTokens(user.id);
            accessToken = tokens.accessToken;
            refreshToken = tokens.refreshToken;
            console.log(`[${requestId}] ✅ Tokens generated successfully`);
        } catch (tokenError) {
            console.error(`[${requestId}] ❌ Token generation failed:`, tokenError);
            throw new ApiError(500, "Failed to generate authentication tokens. Please try again.");
        }

        // Get user data for response
        console.log(`[${requestId}] 🔍 Fetching user data for response...`);
        let loggedInUser;
        try {
            loggedInUser = await User.findByPk(user.id, {
                attributes: { exclude: ['password', 'refreshToken'] }
            });
        } catch (fetchError) {
            console.error(`[${requestId}] ❌ Failed to fetch user data:`, fetchError);
            throw new ApiError(500, "Failed to fetch user information. Please try again.");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
        };

        console.log(`[${requestId}] ✅ Login successful for user: ${user.fullName} (${user.id})`);

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

    } catch (error) {
        console.error(`[${requestId}] 💥 loginWithPhone error:`, {
            message: error.message,
            name: error.name,
            statusCode: error.statusCode,
            stack: process.env.NODE_ENV === 'development' ? error.stack : 'Stack trace hidden in production'
        });
        
        // If it's already an ApiError, just throw it (it will be handled by asyncHandler)
        if (error.statusCode) {
            throw error;
        }
        
        // Handle specific database error types
        if (error.name === 'SequelizeConnectionError' || error.name === 'ConnectionError') {
            throw new ApiError(503, "Database connection failed. Please try again later.");
        }
        
        if (error.name === 'SequelizeTimeoutError') {
            throw new ApiError(504, "Database request timeout. Please try again.");
        }
        
        if (error.name === 'SequelizeAccessDeniedError') {
            throw new ApiError(503, "Database access denied. Please contact support.");
        }
        
        // For any other unexpected errors
        console.error(`[${requestId}] 🚨 Unexpected error in loginWithPhone:`, error);
        throw new ApiError(500, "An unexpected error occurred during login. Please try again.");
    }
});

const sendDummyOTP = asyncHandler(async (req, res) => {
    console.log('sendDummyOTP - Request body:', req.body); // Debug log
    console.log('sendDummyOTP - Content-Type:', req.headers['content-type']); // Debug log
    
    const { phone } = req.body;

    // Add more comprehensive validation
    if (!phone || phone.trim() === '') {
        console.log('sendDummyOTP - Phone validation failed:', { phone, type: typeof phone });
        throw new ApiError(400, "Phone number is required");
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
        throw new ApiError(400, "Please provide a valid 10-digit phone number");
    }

    const user = await User.findOne({ where: { phone: phone.trim() } });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // For now, always use dummy OTP: 123456
    const dummyOTP = "123456";
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.update({
        otpCode: dummyOTP,
        otpExpiry: otpExpiry
    });

    // In development, show the OTP in console
    console.log(`🔐 Dummy OTP for ${phone}: ${dummyOTP} (expires in 10 minutes)`);

    return res.status(200).json(
        new ApiResponse(200, { 
            message: "OTP sent successfully",
            // In development, return the OTP for testing
            otp: process.env.NODE_ENV === 'development' ? dummyOTP : undefined
        }, "OTP sent successfully")
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

const sendRegistrationOTP = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, phone } = req.body;

    // Validate all required fields
    if ([fullName, email, username, password, phone].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        where: {
            [Op.or]: [{ username }, { email }, { phone }]
        }
    });

    if (existedUser) {
        throw new ApiError(409, "User with email, username or phone already exists");
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
        throw new ApiError(400, "Please provide a valid 10-digit phone number");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Please enter a valid email address");
    }

    // Store registration data temporarily in session/cache (for now, we'll create a temporary user)
    // In production, you might want to use Redis or another caching solution
    const tempUser = await User.create({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        isVerified: false, // Mark as unverified until OTP is confirmed
        otpCode: "123456", // Use dummy OTP for now
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    console.log(`🔐 Registration OTP for ${phone}: 123456 (expires in 10 minutes)`);

    return res.status(200).json(
        new ApiResponse(200, { 
            message: "Registration OTP sent successfully",
            // In development, return the OTP for testing
            otp: process.env.NODE_ENV === 'development' ? "123456" : undefined
        }, "Registration OTP sent successfully")
    );
});

const verifyRegistrationOTP = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        throw new ApiError(400, "Phone number and OTP are required");
    }

    // Find the temporary user with matching phone and OTP
    const user = await User.findOne({ 
        where: { 
            phone: phone.trim(),
            otpCode: otp.trim(),
            otpExpiry: { [Op.gt]: new Date() },
            isVerified: false // Only unverified users
        }
    });

    if (!user) {
        throw new ApiError(401, "Invalid or expired OTP");
    }

    // Verify the user and clear OTP
    await user.update({
        otpCode: null,
        otpExpiry: null,
        phoneVerified: true,
        isVerified: true,
        lastLogin: new Date()
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

    const verifiedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: verifiedUser,
                    accessToken,
                    refreshToken,
                },
                "Registration completed successfully"
            )
        );
});

export {
    registerUser,
    sendLoginOTP,
    sendDummyOTP,
    verifyOTPAndLogin,
    verifyOTPFor2FA,
    loginUser,
    loginWithPhone,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    sendRegistrationOTP,
    verifyRegistrationOTP,
};