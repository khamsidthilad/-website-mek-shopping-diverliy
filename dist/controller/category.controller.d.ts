import { Request, Response } from "express";
declare class CategoryController {
    getAllCategories(req: Request, res: Response): Promise<void>;
    getCategoryById(req: Request, res: Response): Promise<void>;
    searchCategories(req: Request, res: Response): Promise<void>;
    getProductsByCategory(req: Request, res: Response): Promise<void>;
    createCategory(req: Request, res: Response): Promise<void>;
    updatecategory(req: Request, res: Response): Promise<void>;
    deleteCategory(req: Request, res: Response): Promise<void>;
    getCategoryStatsOverview(req: Request, res: Response): Promise<void>;
}
declare const _default: CategoryController;
export default _default;
//# sourceMappingURL=category.controller.d.ts.map