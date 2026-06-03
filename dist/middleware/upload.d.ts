import { Request, Response, NextFunction } from 'express';
export declare const uploadProductImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadPaymentReceipt: (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadBrandLogo: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const handleUploadError: (err: Error, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=upload.d.ts.map