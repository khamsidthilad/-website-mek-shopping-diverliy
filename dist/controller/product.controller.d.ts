import { Request, Response } from "express";
declare class ProductController {
    getAllProducts(req: Request, res: Response): Promise<void>;
    getProductById(req: Request, res: Response): Promise<void>;
    searchProducts(req: Request, res: Response): Promise<void>;
    createProduct(req: Request, res: Response): Promise<void>;
    updateProduct(req: Request, res: Response): Promise<void>;
    deleteProduct(req: Request, res: Response): Promise<void>;
}
declare const _default: ProductController;
export default _default;
//# sourceMappingURL=product.controller.d.ts.map