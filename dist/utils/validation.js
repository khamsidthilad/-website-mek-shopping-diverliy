"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePagination = exports.Schemas = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errorMessages
            });
        }
        next();
    };
};
exports.validateRequest = validateRequest;
exports.Schemas = {
    product: {
        create: joi_1.default.object({
            pro_name: joi_1.default.string().required().max(50).messages({
                'string.empty': 'Product name is required',
                'string.max': 'Product name cannot exceed 50 characters'
            }),
            pro_detail: joi_1.default.string().max(100).allow('', null),
            pro_qty: joi_1.default.number().integer().min(0).required().messages({
                'number.base': 'Quantity must be a number',
                'number.integer': 'Quantity must be an integer',
                'number.min': 'Quantity cannot be negative'
            }),
            cate_id: joi_1.default.number().integer().required().messages({
                'number.base': 'Category ID must be a number',
                'any.required': 'Category ID is required'
            }),
            pro_price: joi_1.default.number().integer().min(0).required().messages({
                'number.base': 'Price must be a number',
                'number.min': 'Price cannot be negative'
            })
        }),
        update: joi_1.default.object({
            pro_name: joi_1.default.string().max(50),
            pro_detail: joi_1.default.string().max(100).allow('', null),
            pro_qty: joi_1.default.number().integer().min(0).messages({
                'number.base': 'Quantity must be a number',
                'number.integer': 'Quantity must be an integer',
                'number.min': 'Quantity cannot be negative'
            }),
            cate_id: joi_1.default.number().integer(),
            pro_price: joi_1.default.number().integer().min(0).messages({
                'number.base': 'Price must be a number',
                'number.min': 'Price cannot be negative'
            })
        })
    },
    category: {
        create: joi_1.default.object({
            cate_name: joi_1.default.string().required().max(100).messages({
                'string.empty': 'Category name is required',
                'string.max': 'Category name cannot exceed 100 characters'
            }),
        }),
        update: joi_1.default.object({
            cate_name: joi_1.default.string().max(100),
        })
    },
    customer: {
        create: joi_1.default.object({
            cus_name: joi_1.default.string().required().max(100).messages({
                'string.empty': 'Customer name is required',
                'string.max': 'Customer name cannot exceed 100 characters'
            }),
            tel: joi_1.default.string().required().pattern(/^\d{9,15}$/).messages({
                'string.empty': 'Telephone number is required',
                'string.pattern.base': 'Telephone number must be between 9-15 digits'
            }),
            address: joi_1.default.string().allow('', null),
            email: joi_1.default.string().email().required().messages({
                'string.email': 'Email must be valid',
                'string.empty': 'Email is required'
            }),
            password: joi_1.default.string().required().min(6).messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters'
            })
        }),
        update: joi_1.default.object({
            cus_name: joi_1.default.string().max(100),
            tel: joi_1.default.string().pattern(/^\d{9,15}$/),
            address: joi_1.default.string().max(50).allow('', null),
            cus_status: joi_1.default.string().valid('active', 'inactive'),
            email: joi_1.default.string().email()
        }),
        updatePassword: joi_1.default.object({
            currentPassword: joi_1.default.string().required().messages({
                'string.empty': 'Current password is required'
            }),
            newPassword: joi_1.default.string().required().min(6).messages({
                'string.empty': 'New password is required',
                'string.min': 'New password must be at least 6 characters'
            })
        })
    },
    order: {
        create: joi_1.default.object({
            customerId: joi_1.default.number().integer().required().messages({
                'number.base': 'Customer ID must be a number',
                'any.required': 'Customer ID is required'
            }),
            items: joi_1.default.array().items(joi_1.default.object({
                productId: joi_1.default.number().integer().required(),
                quantity: joi_1.default.number().integer().min(1).required(),
                price: joi_1.default.number().precision(2).min(0).required()
            })).min(1).required().messages({
                'array.min': 'Order must have at least one item',
                'any.required': 'Order items are required'
            }),
            totalPrice: joi_1.default.number().precision(2).min(0).required().messages({
                'number.base': 'Total price must be a number',
                'number.min': 'Total price cannot be negative',
                'any.required': 'Total price is required'
            }),
            shippingAddress: joi_1.default.string().allow('', null),
            shippingNote: joi_1.default.string().allow('', null)
        })
    },
    payment: {
        verify: joi_1.default.object({
            status: joi_1.default.string().valid('verified', 'rejected').required().messages({
                'any.only': 'Status must be either verified or rejected',
                'any.required': 'Status is required'
            })
        }),
        refund: joi_1.default.object({
            reason: joi_1.default.string().required().messages({
                'string.empty': 'Refund reason is required'
            }),
            amount: joi_1.default.number().precision(2).min(0)
        })
    },
    auth: {
        register: joi_1.default.object({
            name: joi_1.default.string().required().max(100).messages({
                'string.empty': 'First name is required',
                'string.max': 'First name cannot exceed 100 characters'
            }),
            sname: joi_1.default.string().required().max(100).messages({
                'string.empty': 'Last name is required',
                'string.max': 'Last name cannot exceed 100 characters'
            }),
            dateOfBirth: joi_1.default.date().max('now').messages({
                'date.max': 'Date of birth cannot be in the future'
            }),
            username: joi_1.default.string().required().email().messages({
                'string.email': 'Username must be a valid email',
                'string.empty': 'Username is required'
            }),
            password: joi_1.default.string().required().min(6).messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters'
            }),
            tel: joi_1.default.string().pattern(/^\d{9,15}$/).messages({
                'string.pattern.base': 'Telephone number must be between 9-15 digits'
            }),
            address: joi_1.default.string().allow('', null)
        }),
        login: joi_1.default.object({
            username: joi_1.default.string().required().messages({
                'string.empty': 'Username is required'
            }),
            password: joi_1.default.string().required().messages({
                'string.empty': 'Password is required'
            })
        }),
        changePassword: joi_1.default.object({
            currentPassword: joi_1.default.string().required().messages({
                'string.empty': 'Current password is required'
            }),
            newPassword: joi_1.default.string().required().min(6).messages({
                'string.empty': 'New password is required',
                'string.min': 'New password must be at least 6 characters'
            })
        })
    }
};
const validatePagination = (req, res, next) => {
    const schema = joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10)
    });
    const { error, value } = schema.validate(req.query, {
        stripUnknown: true
    });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid pagination parameters',
            errors: error.details.map(detail => detail.message)
        });
    }
    req.query.page = value.page.toString();
    req.query.limit = value.limit.toString();
    next();
};
exports.validatePagination = validatePagination;
exports.default = { validateRequest: exports.validateRequest, Schemas: exports.Schemas, validatePagination: exports.validatePagination };
//# sourceMappingURL=validation.js.map