"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadBrandLogo = exports.uploadPaymentReceipt = exports.uploadProductImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createDirIfNotExists = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
const productStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../public/images/products');
        createDirIfNotExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});
const paymentStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../public/uploads/payments');
        createDirIfNotExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, 'payment-' + uniqueSuffix + ext);
    }
});
const brandLogoStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../public/images/brands');
        createDirIfNotExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, 'brand-' + uniqueSuffix + ext);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
};
exports.uploadProductImage = (0, multer_1.default)({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
}).single('image');
// Normalize uploadPaymentReceipt to behave like `.single()` by setting `req.file`.
// Accepts one of: receipt | image | file.
const uploadPaymentReceipt = (req, res, next) => {
    const uploader = (0, multer_1.default)({
        storage: paymentStorage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter
    }).any();
    uploader(req, res, (err) => {
        if (err)
            return next(err);
        const files = req.files;
        if (Array.isArray(files) && files.length > 1) {
            return next(new Error('Only one payment receipt file is allowed.'));
        }
        req.file = Array.isArray(files) ? files[0] : undefined;
        next();
    });
};
exports.uploadPaymentReceipt = uploadPaymentReceipt;
exports.uploadBrandLogo = (0, multer_1.default)({
    storage: brandLogoStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for brand logos
    fileFilter
}).single('logo');
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Max size is 5MB for product images, 10MB for payment receipts, and 2MB for brand logos.'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.js.map