import { Request, Response } from "express";
declare class CustomerController {
    getAllCustomers(req: Request, res: Response): Promise<void>;
    searchCustomers(req: Request, res: Response): Promise<void>;
    getCustomerStats(req: Request, res: Response): Promise<void>;
    createCustomer(req: Request, res: Response): Promise<void>;
    deleteCustomer(req: Request, res: Response): Promise<void>;
    getCustomerById(req: Request, res: Response): Promise<void>;
    updateCustomer(req: Request, res: Response): Promise<void>;
    getCustomerOrders(req: Request, res: Response): Promise<void>;
}
declare const _default: CustomerController;
export default _default;
//# sourceMappingURL=customer.controller.d.ts.map