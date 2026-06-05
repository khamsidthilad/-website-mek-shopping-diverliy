import "../models";
import { Request, Response } from "express";
declare class BrandCateController {
    getAllLinks(req: Request, res: Response): Promise<void>;
    getLinksByBrand(req: Request, res: Response): Promise<void>;
    getLinksByCategory(req: Request, res: Response): Promise<void>;
    createLink(req: Request, res: Response): Promise<void>;
    setBrandCategories(req: Request, res: Response): Promise<void>;
    deleteLink(req: Request, res: Response): Promise<void>;
}
declare const _default: BrandCateController;
export default _default;
//# sourceMappingURL=brandCate.controller.d.ts.map