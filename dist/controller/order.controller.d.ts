import { Request, Response } from "express";
declare class OrderController {
    createOrder(req: Request, res: Response): Promise<void>;
    getOrderDetails(req: Request, res: Response): Promise<void>;
    uploadPaymentReceipt(req: Request, res: Response): Promise<void>;
    getReportOrder(req: Request, res: Response): Promise<void>;
    getCustomerOrders(req: Request, res: Response): Promise<void>;
    updateOrderStatus(req: Request, res: Response): Promise<void>;
    cancelOrder(req: Request, res: Response): Promise<void>;
}
declare const _default: OrderController;
export default _default;
//# sourceMappingURL=order.controller.d.ts.map