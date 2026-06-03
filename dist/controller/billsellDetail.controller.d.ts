import { Request, Response } from "express";
declare class BillSellDetailController {
    getAllBillSellDetails(req: Request, res: Response): Promise<void>;
    getBillSellDetailById(req: Request, res: Response): Promise<void>;
    getBillSellDetailsByOrderId(req: Request, res: Response): Promise<void>;
    createBillSellDetail(req: Request, res: Response): Promise<void>;
    updateBillSellDetail(req: Request, res: Response): Promise<void>;
    deleteBillSellDetail(req: Request, res: Response): Promise<void>;
}
declare const _default: BillSellDetailController;
export default _default;
//# sourceMappingURL=billsellDetail.controller.d.ts.map