import { Request, Response } from "express";
declare class SupplierController {
    getAllSuppliers(req: Request, res: Response): Promise<void>;
    getSupplierById(req: Request, res: Response): Promise<void>;
    createSupplier(req: Request, res: Response): Promise<void>;
    updateSupplier(req: Request, res: Response): Promise<void>;
    deleteSupplier(req: Request, res: Response): Promise<void>;
}
declare const _default: SupplierController;
export default _default;
//# sourceMappingURL=supplier.controller.d.ts.map