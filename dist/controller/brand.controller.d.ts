import "../models";
import { Request, Response } from "express";
declare class BrandController {
    getAllBrands(req: Request, res: Response): Promise<void>;
    getBrandById(req: Request, res: Response): Promise<void>;
    createBrand(req: Request, res: Response): Promise<void>;
    updateBrand(req: Request, res: Response): Promise<void>;
    deleteBrand(req: Request, res: Response): Promise<void>;
}
declare const _default: BrandController;
export default _default;
//# sourceMappingURL=brand.controller.d.ts.map