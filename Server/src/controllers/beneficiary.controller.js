import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { User, Beneficiary } from "../models/index.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { Op } from "sequelize";

const addBeneficiary = asyncHandler(async (req, res) => {
    const { name, accountNumber, ifscCode, bankName, accountType, nickname, phone } = req.body;

    if (!name || !accountNumber || !ifscCode || !bankName) {
        throw new ApiError(400, "Name, account number, IFSC code, and bank name are required");
    }

    // Check if beneficiary already exists for this user
    const existingBeneficiary = await Beneficiary.findOne({
        where: {
            userId: req.user.id,
            accountNumber
        }
    });

    if (existingBeneficiary) {
        throw new ApiError(409, "Beneficiary with this account number already exists");
    }

    const beneficiary = await Beneficiary.create({
        userId: req.user.id,
        name,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName,
        accountType: accountType || 'savings',
        nickname,
        phone
    });

    return res.status(201).json(
        new ApiResponse(201, beneficiary, "Beneficiary added successfully")
    );
});

const getBeneficiaries = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { 
        userId: req.user.id,
        isActive: true
    };

    if (search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { nickname: { [Op.like]: `%${search}%` } },
            { bankName: { [Op.like]: `%${search}%` } },
            { accountNumber: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows: beneficiaries } = await Beneficiary.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            beneficiaries,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: totalPages
            }
        }, "Beneficiaries fetched successfully")
    );
});

const getBeneficiaryById = asyncHandler(async (req, res) => {
    const { beneficiaryId } = req.params;

    const beneficiary = await Beneficiary.findOne({
        where: {
            id: beneficiaryId,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!beneficiary) {
        throw new ApiError(404, "Beneficiary not found");
    }

    return res.status(200).json(
        new ApiResponse(200, beneficiary, "Beneficiary fetched successfully")
    );
});

const updateBeneficiary = asyncHandler(async (req, res) => {
    const { beneficiaryId } = req.params;
    const { name, bankName, nickname, phone } = req.body;

    const beneficiary = await Beneficiary.findOne({
        where: {
            id: beneficiaryId,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!beneficiary) {
        throw new ApiError(404, "Beneficiary not found");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (bankName) updateData.bankName = bankName;
    if (nickname) updateData.nickname = nickname;
    if (phone) updateData.phone = phone;

    await beneficiary.update(updateData);

    return res.status(200).json(
        new ApiResponse(200, beneficiary, "Beneficiary updated successfully")
    );
});

const deleteBeneficiary = asyncHandler(async (req, res) => {
    const { beneficiaryId } = req.params;

    const beneficiary = await Beneficiary.findOne({
        where: {
            id: beneficiaryId,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!beneficiary) {
        throw new ApiError(404, "Beneficiary not found");
    }

    // Soft delete
    await beneficiary.update({ isActive: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Beneficiary deleted successfully")
    );
});

const verifyBeneficiary = asyncHandler(async (req, res) => {
    const { beneficiaryId } = req.params;

    const beneficiary = await Beneficiary.findOne({
        where: {
            id: beneficiaryId,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!beneficiary) {
        throw new ApiError(404, "Beneficiary not found");
    }

    // TODO: Implement actual bank account verification logic
    // This would typically involve calling a bank verification API
    
    // For now, we'll simulate verification
    const isValid = true; // Replace with actual verification logic

    if (isValid) {
        await beneficiary.update({ isVerified: true });
        
        return res.status(200).json(
            new ApiResponse(200, beneficiary, "Beneficiary verified successfully")
        );
    } else {
        throw new ApiError(400, "Beneficiary verification failed");
    }
});

const toggleBeneficiaryStatus = asyncHandler(async (req, res) => {
    const { beneficiaryId } = req.params;

    const beneficiary = await Beneficiary.findOne({
        where: {
            id: beneficiaryId,
            userId: req.user.id
        }
    });

    if (!beneficiary) {
        throw new ApiError(404, "Beneficiary not found");
    }

    await beneficiary.update({
        isActive: !beneficiary.isActive
    });

    return res.status(200).json(
        new ApiResponse(200, { isActive: beneficiary.isActive }, 
        `Beneficiary ${beneficiary.isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

export {
    addBeneficiary,
    getBeneficiaries,
    getBeneficiaryById,
    updateBeneficiary,
    deleteBeneficiary,
    verifyBeneficiary,
    toggleBeneficiaryStatus
};