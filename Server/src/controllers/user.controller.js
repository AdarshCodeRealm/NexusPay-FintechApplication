import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { User } from "../models/index.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/utils/cloudinary.js";
import { Op } from "sequelize";

const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "Full name and email are required");
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
        where: {
            email,
            id: { [Op.ne]: req.user.id }
        }
    });

    if (existingUser) {
        throw new ApiError(409, "Email is already taken");
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await user.update({
        fullName,
        email: email.toLowerCase()
    });

    const updatedUser = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});

const submitKYC = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.kycStatus === 'approved') {
        throw new ApiError(400, "KYC is already approved");
    }

    const uploadPromises = [];
    const kycDocuments = {};

    // Upload Aadhar document
    if (req.files?.aadhar) {
        uploadPromises.push(
            uploadOnCloudinary(req.files.aadhar[0].path).then(result => {
                kycDocuments.aadhar = result?.url;
            })
        );
    }

    // Upload PAN document
    if (req.files?.pan) {
        uploadPromises.push(
            uploadOnCloudinary(req.files.pan[0].path).then(result => {
                kycDocuments.pan = result?.url;
            })
        );
    }

    // Upload Address proof
    if (req.files?.address) {
        uploadPromises.push(
            uploadOnCloudinary(req.files.address[0].path).then(result => {
                kycDocuments.address = result?.url;
            })
        );
    }

    if (uploadPromises.length === 0) {
        throw new ApiError(400, "At least one KYC document is required");
    }

    try {
        await Promise.all(uploadPromises);

        await user.update({
            kycStatus: 'submitted',
            kycDocuments: {
                ...user.kycDocuments,
                ...kycDocuments,
                submittedAt: new Date()
            }
        });

        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'refreshToken'] }
        });

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "KYC documents submitted successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to upload documents: " + error.message);
    }
});

const approveKYC = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can approve KYC");
    }

    const user = await User.findByPk(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.kycStatus !== 'submitted') {
        throw new ApiError(400, "KYC is not in submitted state");
    }

    await user.update({
        kycStatus: 'approved',
        kycDocuments: {
            ...user.kycDocuments,
            approvedAt: new Date(),
            approvedBy: req.user.id
        }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "KYC approved successfully")
    );
});

const rejectKYC = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;

    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can reject KYC");
    }

    if (!reason) {
        throw new ApiError(400, "Rejection reason is required");
    }

    const user = await User.findByPk(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.kycStatus !== 'submitted') {
        throw new ApiError(400, "KYC is not in submitted state");
    }

    await user.update({
        kycStatus: 'rejected',
        kycDocuments: {
            ...user.kycDocuments,
            rejectedAt: new Date(),
            rejectedBy: req.user.id,
            rejectionReason: reason
        }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "KYC rejected successfully")
    );
});

const addRetailer = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, phone } = req.body;

    if (req.user.role !== 'distributor') {
        throw new ApiError(403, "Only distributors can add retailers");
    }

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

    const retailer = await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
        phone,
        role: 'retailer',
        parentDistributorId: req.user.id
    });

    const createdRetailer = await User.findByPk(retailer.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });

    return res.status(201).json(
        new ApiResponse(201, createdRetailer, "Retailer added successfully")
    );
});

const getRetailers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    if (req.user.role !== 'distributor') {
        throw new ApiError(403, "Only distributors can view retailers");
    }

    const whereClause = { 
        parentDistributorId: req.user.id,
        role: 'retailer'
    };

    if (search) {
        whereClause[Op.or] = [
            { fullName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows: retailers } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password', 'refreshToken', 'otpCode'] }
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            retailers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: totalPages
            }
        }, "Retailers fetched successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, kycStatus, search } = req.query;
    const offset = (page - 1) * limit;

    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can view all users");
    }

    const whereClause = {};

    if (role) {
        whereClause.role = role;
    }

    if (kycStatus) {
        whereClause.kycStatus = kycStatus;
    }

    if (search) {
        whereClause[Op.or] = [
            { fullName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password', 'refreshToken', 'otpCode'] }
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: totalPages
            }
        }, "Users fetched successfully")
    );
});

const getUsersList = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, kycStatus, search } = req.query;
    const offset = (page - 1) * limit;

    if (req.user.role !== 'admin' && req.user.role !== 'distributor') {
        throw new ApiError(403, "Access denied");
    }

    const whereClause = {};

    if (role) {
        whereClause.role = role;
    }

    if (kycStatus) {
        whereClause.kycStatus = kycStatus;
    }

    if (search) {
        whereClause[Op.or] = [
            { fullName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } }
        ];
    }

    // If distributor, only show their retailers
    if (req.user.role === 'distributor') {
        whereClause.parentDistributorId = req.user.id;
    }

    const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password', 'refreshToken', 'otpCode'] }
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: totalPages
            }
        }, "Users fetched successfully")
    );
});

const getUserStats = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can view user stats");
    }

    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const kycPending = await User.count({ where: { kycStatus: 'pending' } });
    const kycSubmitted = await User.count({ where: { kycStatus: 'submitted' } });
    const kycApproved = await User.count({ where: { kycStatus: 'approved' } });
    const kycRejected = await User.count({ where: { kycStatus: 'rejected' } });

    const roleStats = await User.findAll({
        attributes: [
            'role',
            [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
        ],
        group: ['role']
    });

    return res.status(200).json(
        new ApiResponse(200, {
            totalUsers,
            activeUsers,
            kyc: {
                pending: kycPending,
                submitted: kycSubmitted,
                approved: kycApproved,
                rejected: kycRejected
            },
            roleDistribution: roleStats.reduce((acc, stat) => {
                acc[stat.role] = parseInt(stat.dataValues.count);
                return acc;
            }, {})
        }, "User statistics fetched successfully")
    );
});

const updateUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can update user status");
    }

    const user = await User.findByPk(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role === 'admin') {
        throw new ApiError(400, "Cannot deactivate admin user");
    }

    await user.update({
        isActive: !user.isActive
    });

    return res.status(200).json(
        new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

const toggleUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can toggle user status");
    }

    const user = await User.findByPk(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role === 'admin') {
        throw new ApiError(400, "Cannot deactivate admin user");
    }

    await user.update({
        isActive: !user.isActive
    });

    return res.status(200).json(
        new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

const searchUserByPhone = asyncHandler(async (req, res) => {
    const { phone } = req.params;

    if (!phone) {
        throw new ApiError(400, "Phone number is required");
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
        throw new ApiError(400, "Please provide a valid 10-digit phone number");
    }

    const user = await User.findOne({
        where: { 
            phone: phone.trim(),
            isActive: true 
        },
        attributes: ['id', 'fullName', 'phone', 'email']
    });

    if (!user) {
        return res.status(404).json(
            new ApiResponse(404, null, "User not found with this phone number")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User found successfully")
    );
});

export {
    updateProfile,
    submitKYC,
    approveKYC,
    rejectKYC,
    addRetailer,
    getRetailers,
    updateUserStatus,
    getAllUsers,
    getUsersList,
    getUserStats,
    toggleUserStatus,
    searchUserByPhone
};