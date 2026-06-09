import { Request, Response } from "express";
declare class UserController {
    getAllUsers(_req: Request, res: Response): Promise<void>;
    getCurrentUser(req: Request, res: Response): Promise<void>;
    getUserById(req: Request, res: Response): Promise<void>;
    createUser(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
}
declare const _default: UserController;
export default _default;
//# sourceMappingURL=user.controller.d.ts.map