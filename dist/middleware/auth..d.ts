import { Request, Response, NextFunction } from "express";
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const isStaff: (req: Request, res: Response, next: NextFunction) => void;
export declare const isCustomer: (req: Request, res: Response, next: NextFunction) => void;
export declare const isOwnCustomer: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth..d.ts.map