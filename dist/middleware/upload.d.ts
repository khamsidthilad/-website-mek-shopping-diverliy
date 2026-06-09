import { Request, Response, NextFunction } from 'express';
export declare const uploadProductImage: (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadPaymentReceipt: (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadBrandLogo: (req: Request, res: Response, next: NextFunction) => void;
export declare const handleUploadError: (err: Error, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=upload.d.ts.map