import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const createDirIfNotExists = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/images/products');
        createDirIfNotExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const paymentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/payments');
        createDirIfNotExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'payment-' + uniqueSuffix + ext);
    }
});

const brandLogoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/images/brands');
        createDirIfNotExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'brand-' + uniqueSuffix + ext);
    }
});

const categoryImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/images/categories');
        createDirIfNotExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'category-' + uniqueSuffix + ext);
    }
});

const fileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
};

const PRODUCT_IMAGE_FIELDS = ['image', 'pro_image', 'proImage', 'file'];

// Normalize uploadProductImage to behave like `.single()` by setting `req.file`.
// Accepts one of: image | pro_image | proImage | file.
export const uploadProductImage = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const uploader = multer({
        storage: productStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter
    }).any();

    uploader(req, res, (err: any) => {
        if (err) return next(err);

        const files = (req as any).files as Express.Multer.File[] | undefined;
        const imageFiles = Array.isArray(files)
            ? files.filter((file) => PRODUCT_IMAGE_FIELDS.includes(file.fieldname))
            : [];

        if (imageFiles.length > 1) {
            return next(new Error('Only one product image file is allowed.'));
        }

        (req as any).file = imageFiles[0];
        next();
    });
};

// Normalize uploadPaymentReceipt to behave like `.single()` by setting `req.file`.
// Accepts one of: receipt | image | file.
export const uploadPaymentReceipt = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const uploader = multer({
        storage: paymentStorage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter
    }).any();

    uploader(req, res, (err: any) => {
        if (err) return next(err);

        const files = (req as any).files as Express.Multer.File[] | undefined;
        if (Array.isArray(files) && files.length > 1) {
            return next(new Error('Only one payment receipt file is allowed.'));
        }

        (req as any).file = Array.isArray(files) ? files[0] : undefined;
        next();
    });
};

const BRAND_LOGO_FIELDS = ['logo', 'brand_logo', 'brandLogo', 'image', 'file'];

// Normalize uploadBrandLogo to behave like `.single()` by setting `req.file`.
// Accepts one of: logo | brand_logo | brandLogo | image | file.
export const uploadBrandLogo = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const uploader = multer({
        storage: brandLogoStorage,
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for brand logos
        fileFilter
    }).any();

    uploader(req, res, (err: any) => {
        if (err) return next(err);

        const files = (req as any).files as Express.Multer.File[] | undefined;
        const logoFiles = Array.isArray(files)
            ? files.filter((file) => BRAND_LOGO_FIELDS.includes(file.fieldname))
            : [];

        if (logoFiles.length > 1) {
            return next(new Error('Only one brand logo file is allowed.'));
        }

        (req as any).file = logoFiles[0];
        next();
    });
};

const CATEGORY_IMAGE_FIELDS = ['image', 'cate_image', 'cateImage', 'file'];

/** Accepts one of: image | cate_image | cateImage | file */
export const uploadCategoryImage = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const uploader = multer({
        storage: categoryImageStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter
    }).any();

    uploader(req, res, (err: any) => {
        if (err) return next(err);

        const files = (req as any).files as Express.Multer.File[] | undefined;
        const imageFiles = Array.isArray(files)
            ? files.filter((file) => CATEGORY_IMAGE_FIELDS.includes(file.fieldname))
            : [];

        if (imageFiles.length > 1) {
            return next(new Error('Only one category image file is allowed.'));
        }

        (req as any).file = imageFiles[0];
        next();
    });
};

export const handleUploadError = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Max size is 5MB for product/category images, 10MB for payment receipts, and 2MB for brand logos.'
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