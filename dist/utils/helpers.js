"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidThaiPhone = exports.isValidEmail = exports.maskSensitiveData = exports.truncateText = exports.thaiDateToISODate = exports.removeFileIfExists = exports.fileExists = exports.generateTrackingNumber = exports.generateOrderNumber = exports.satangToBaht = exports.bahtToSatang = exports.calculateOffset = exports.getPaginationData = exports.formatDate = exports.formatCurrency = exports.sanitizeFilename = exports.generateUniqueFilename = exports.generateRandomString = void 0;
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const generateRandomString = (length = 10) => {
    return crypto_1.default.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};
exports.generateRandomString = generateRandomString;
const generateUniqueFilename = (originalname) => {
    const timestamp = Date.now();
    const randomStr = (0, exports.generateRandomString)(6);
    const ext = path_1.default.extname(originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;
    return filename;
};
exports.generateUniqueFilename = generateUniqueFilename;
const sanitizeFilename = (filename) => {
    return filename.replace(/[^\w\-\.]/g, '_');
};
exports.sanitizeFilename = sanitizeFilename;
const formatCurrency = (amount, currency = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatDate = (date, format = 'locale') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (format === 'locale') {
        return dateObj.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    else if (format === 'short') {
        return dateObj.toLocaleDateString('th-TH');
    }
    else if (format === 'iso') {
        return dateObj.toISOString();
    }
    else if (format === 'timestamp') {
        return dateObj.getTime().toString();
    }
    else if (format === 'mysql') {
        return dateObj.toISOString().slice(0, 19).replace('T', ' ');
    }
    return dateObj.toLocaleDateString('th-TH');
};
exports.formatDate = formatDate;
const getPaginationData = (req, total) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(total / limit);
    return {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};
exports.getPaginationData = getPaginationData;
const calculateOffset = (page, limit) => {
    return (page - 1) * limit;
};
exports.calculateOffset = calculateOffset;
const bahtToSatang = (amount) => {
    return Math.round(amount * 100);
};
exports.bahtToSatang = bahtToSatang;
const satangToBaht = (amount) => {
    return parseFloat((amount / 100).toFixed(2));
};
exports.satangToBaht = satangToBaht;
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
};
exports.generateOrderNumber = generateOrderNumber;
const generateTrackingNumber = () => {
    const prefix = 'TH';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};
exports.generateTrackingNumber = generateTrackingNumber;
const fileExists = (filepath) => {
    return fs_1.default.existsSync(filepath);
};
exports.fileExists = fileExists;
const removeFileIfExists = (filepath) => {
    try {
        if (fs_1.default.existsSync(filepath)) {
            fs_1.default.unlinkSync(filepath);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Error removing file:', error);
        return false;
    }
};
exports.removeFileIfExists = removeFileIfExists;
const thaiDateToISODate = (thaiDate) => {
    const parts = thaiDate.split('/');
    if (parts.length !== 3)
        return '';
    const day = parts[0];
    const month = parts[1];
    const year = parseInt(parts[2]) - 543;
    return `${year}-${month}-${day}`;
};
exports.thaiDateToISODate = thaiDateToISODate;
const truncateText = (text, length, suffix = '...') => {
    if (text.length <= length)
        return text;
    return text.substring(0, length) + suffix;
};
exports.truncateText = truncateText;
const maskSensitiveData = (data, fieldsToMask = ['password', 'credit_card', 'token']) => {
    if (!data)
        return data;
    const maskedData = { ...data };
    fieldsToMask.forEach(field => {
        if (maskedData[field]) {
            if (typeof maskedData[field] === 'string') {
                const str = maskedData[field];
                if (str.length > 2) {
                    maskedData[field] = str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
                }
                else {
                    maskedData[field] = '***';
                }
            }
            else {
                maskedData[field] = '***';
            }
        }
    });
    return maskedData;
};
exports.maskSensitiveData = maskSensitiveData;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidThaiPhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
};
exports.isValidThaiPhone = isValidThaiPhone;
exports.default = {
    generateRandomString: exports.generateRandomString,
    generateUniqueFilename: exports.generateUniqueFilename,
    sanitizeFilename: exports.sanitizeFilename,
    formatCurrency: exports.formatCurrency,
    formatDate: exports.formatDate,
    getPaginationData: exports.getPaginationData,
    calculateOffset: exports.calculateOffset,
    bahtToSatang: exports.bahtToSatang,
    satangToBaht: exports.satangToBaht,
    generateOrderNumber: exports.generateOrderNumber,
    generateTrackingNumber: exports.generateTrackingNumber,
    fileExists: exports.fileExists,
    removeFileIfExists: exports.removeFileIfExists,
    thaiDateToISODate: exports.thaiDateToISODate,
    truncateText: exports.truncateText,
    maskSensitiveData: exports.maskSensitiveData,
    isValidEmail: exports.isValidEmail,
    isValidThaiPhone: exports.isValidThaiPhone
};
//# sourceMappingURL=helpers.js.map