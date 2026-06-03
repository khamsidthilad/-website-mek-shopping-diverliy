import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: Joi.Schema, property?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const Schemas: {
    product: {
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
    };
    category: {
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
    };
    customer: {
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
        updatePassword: Joi.ObjectSchema<any>;
    };
    order: {
        create: Joi.ObjectSchema<any>;
    };
    payment: {
        verify: Joi.ObjectSchema<any>;
        refund: Joi.ObjectSchema<any>;
    };
    auth: {
        register: Joi.ObjectSchema<any>;
        login: Joi.ObjectSchema<any>;
        changePassword: Joi.ObjectSchema<any>;
    };
};
export declare const validatePagination: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
declare const _default: {
    validateRequest: (schema: Joi.Schema, property?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    Schemas: {
        product: {
            create: Joi.ObjectSchema<any>;
            update: Joi.ObjectSchema<any>;
        };
        category: {
            create: Joi.ObjectSchema<any>;
            update: Joi.ObjectSchema<any>;
        };
        customer: {
            create: Joi.ObjectSchema<any>;
            update: Joi.ObjectSchema<any>;
            updatePassword: Joi.ObjectSchema<any>;
        };
        order: {
            create: Joi.ObjectSchema<any>;
        };
        payment: {
            verify: Joi.ObjectSchema<any>;
            refund: Joi.ObjectSchema<any>;
        };
        auth: {
            register: Joi.ObjectSchema<any>;
            login: Joi.ObjectSchema<any>;
            changePassword: Joi.ObjectSchema<any>;
        };
    };
    validatePagination: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
};
export default _default;
//# sourceMappingURL=validation.d.ts.map