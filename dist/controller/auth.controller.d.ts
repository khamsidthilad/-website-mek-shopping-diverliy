import { Request, Response } from "express";
declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: Request, res: Response): Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map