import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.Schema, property: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
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

export const Schemas = {
    product: {
        create: Joi.object({
            pro_name: Joi.string().required().max(50).messages({
                'string.empty': 'Product name is required',
                'string.max': 'Product name cannot exceed 50 characters'
            }),
            pro_detail: Joi.string().max(100).allow('', null),
            pro_qty: Joi.number().integer().min(0).required().messages({
                'number.base': 'Quantity must be a number',
                'number.integer': 'Quantity must be an integer',
                'number.min': 'Quantity cannot be negative'
            }),
            cate_id: Joi.number().integer().required().messages({
                'number.base': 'Category ID must be a number',
                'any.required': 'Category ID is required'
            }),
            pro_price: Joi.number().integer().min(0).required().messages({
                'number.base': 'Price must be a number',
                'number.min': 'Price cannot be negative'
            })
        }),
        update: Joi.object({
            pro_name: Joi.string().max(50),
            pro_detail: Joi.string().max(100).allow('', null),
            pro_qty: Joi.number().integer().min(0).messages({
                'number.base': 'Quantity must be a number',
                'number.integer': 'Quantity must be an integer',
                'number.min': 'Quantity cannot be negative'
            }),
            cate_id: Joi.number().integer(),
            pro_price: Joi.number().integer().min(0).messages({
                'number.base': 'Price must be a number',
                'number.min': 'Price cannot be negative'
            })
        })
    },

    category: {
        create: Joi.object({
            cate_name: Joi.string().required().max(100).messages({
                'string.empty': 'Category name is required',
                'string.max': 'Category name cannot exceed 100 characters'
            }),
        }),
        update: Joi.object({
            cate_name: Joi.string().max(100),
        })
    },

    customer: {
        create: Joi.object({
            cus_name: Joi.string().required().max(100).messages({
                'string.empty': 'Customer name is required',
                'string.max': 'Customer name cannot exceed 100 characters'
            }),
            tel: Joi.string().required().pattern(/^\d{9,15}$/).messages({
                'string.empty': 'Telephone number is required',
                'string.pattern.base': 'Telephone number must be between 9-15 digits'
            }),
            address: Joi.string().allow('', null),
            email: Joi.string().email().required().messages({
                'string.email': 'Email must be valid',
                'string.empty': 'Email is required'
            }),
            password: Joi.string().required().min(6).messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters'
            })
        }),
        update: Joi.object({
            cus_name: Joi.string().max(100),
            tel: Joi.string().pattern(/^\d{9,15}$/),
            address: Joi.string().max(50).allow('', null),
            cus_status: Joi.string().valid('active', 'inactive'),
            email: Joi.string().email()
        }),
        updatePassword: Joi.object({
            currentPassword: Joi.string().required().messages({
                'string.empty': 'Current password is required'
            }),
            newPassword: Joi.string().required().min(6).messages({
                'string.empty': 'New password is required',
                'string.min': 'New password must be at least 6 characters'
            })
        })
    },

    order: {
        create: Joi.object({
            customerId: Joi.number().integer().required().messages({
                'number.base': 'Customer ID must be a number',
                'any.required': 'Customer ID is required'
            }),
            items: Joi.array().items(
                Joi.object({
                    productId: Joi.number().integer().required(),
                    quantity: Joi.number().integer().min(1).required(),
                    price: Joi.number().precision(2).min(0).required()
                })
            ).min(1).required().messages({
                'array.min': 'Order must have at least one item',
                'any.required': 'Order items are required'
            }),
            totalPrice: Joi.number().precision(2).min(0).required().messages({
                'number.base': 'Total price must be a number',
                'number.min': 'Total price cannot be negative',
                'any.required': 'Total price is required'
            }),
            shippingAddress: Joi.string().allow('', null),
            shippingNote: Joi.string().allow('', null)
        })
    },

    payment: {
        verify: Joi.object({
            status: Joi.string().valid('verified', 'rejected').required().messages({
                'any.only': 'Status must be either verified or rejected',
                'any.required': 'Status is required'
            })
        }),
        refund: Joi.object({
            reason: Joi.string().required().messages({
                'string.empty': 'Refund reason is required'
            }),
            amount: Joi.number().precision(2).min(0)
        })
    },

    auth: {
        register: Joi.object({
            name: Joi.string().required().max(100).messages({
                'string.empty': 'First name is required',
                'string.max': 'First name cannot exceed 100 characters'
            }),
            sname: Joi.string().required().max(100).messages({
                'string.empty': 'Last name is required',
                'string.max': 'Last name cannot exceed 100 characters'
            }),
            dateOfBirth: Joi.date().max('now').messages({
                'date.max': 'Date of birth cannot be in the future'
            }),
            username: Joi.string().required().email().messages({
                'string.email': 'Username must be a valid email',
                'string.empty': 'Username is required'
            }),
            password: Joi.string().required().min(6).messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters'
            }),
            tel: Joi.string().pattern(/^\d{9,15}$/).messages({
                'string.pattern.base': 'Telephone number must be between 9-15 digits'
            }),
            address: Joi.string().allow('', null)
        }),
        login: Joi.object({
            username: Joi.string().required().messages({
                'string.empty': 'Username is required'
            }),
            password: Joi.string().required().messages({
                'string.empty': 'Password is required'
            })
        }),
        changePassword: Joi.object({
            currentPassword: Joi.string().required().messages({
                'string.empty': 'Current password is required'
            }),
            newPassword: Joi.string().required().min(6).messages({
                'string.empty': 'New password is required',
                'string.min': 'New password must be at least 6 characters'
            })
        })
    }
};

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
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

export default { validateRequest, Schemas, validatePagination };
