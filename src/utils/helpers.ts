import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

export const generateRandomString = (length: number = 10): string => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

export const generateUniqueFilename = (originalname: string): string => {
    const timestamp = Date.now();
    const randomStr = generateRandomString(6);
    const ext = path.extname(originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;
    return filename;
};

export const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[^\w\-\.]/g, '_');
};

export const formatCurrency = (amount: number, currency: string = 'THB'): string => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency
    }).format(amount);
};

export const formatDate = (date: Date | string, format: string = 'locale'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (format === 'locale') {
        return dateObj.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'short') {
        return dateObj.toLocaleDateString('th-TH');
    } else if (format === 'iso') {
        return dateObj.toISOString();
    } else if (format === 'timestamp') {
        return dateObj.getTime().toString();
    } else if (format === 'mysql') {
        return dateObj.toISOString().slice(0, 19).replace('T', ' ');
    }

    return dateObj.toLocaleDateString('th-TH');
};

export const getPaginationData = (req: Request, total: number) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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

export const calculateOffset = (page: number, limit: number): number => {
    return (page - 1) * limit;
};

export const bahtToSatang = (amount: number): number => {
    return Math.round(amount * 100);
};

export const satangToBaht = (amount: number): number => {
    return parseFloat((amount / 100).toFixed(2));
};

export const generateOrderNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
};

export const generateTrackingNumber = (): string => {
    const prefix = 'TH';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};

export const fileExists = (filepath: string): boolean => {
    return fs.existsSync(filepath);
};

export const removeFileIfExists = (filepath: string): boolean => {
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error removing file:', error);
        return false;
    }
};

export const thaiDateToISODate = (thaiDate: string): string => {
    const parts = thaiDate.split('/');
    if (parts.length !== 3) return '';

    const day = parts[0];
    const month = parts[1];
    const year = parseInt(parts[2]) - 543;

    return `${year}-${month}-${day}`;
};

export const truncateText = (text: string, length: number, suffix: string = '...'): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
};

export const maskSensitiveData = (data: any, fieldsToMask: string[] = ['password', 'credit_card', 'token']): any => {
    if (!data) return data;

    const maskedData = { ...data };

    fieldsToMask.forEach(field => {
        if (maskedData[field]) {
            if (typeof maskedData[field] === 'string') {
                const str = maskedData[field];
                if (str.length > 2) {
                    maskedData[field] = str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
                } else {
                    maskedData[field] = '***';
                }
            } else {
                maskedData[field] = '***';
            }
        }
    });

    return maskedData;
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidThaiPhone = (phone: string): boolean => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
};

export default {
    generateRandomString,
    generateUniqueFilename,
    sanitizeFilename,
    formatCurrency,
    formatDate,
    getPaginationData,
    calculateOffset,
    bahtToSatang,
    satangToBaht,
    generateOrderNumber,
    generateTrackingNumber,
    fileExists,
    removeFileIfExists,
    thaiDateToISODate,
    truncateText,
    maskSensitiveData,
    isValidEmail,
    isValidThaiPhone
};
