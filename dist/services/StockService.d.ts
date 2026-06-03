import { Product } from '../models';
import { Transaction } from 'sequelize';
declare class StockService {
    reduceStock(orderId: number, transaction?: Transaction): Promise<boolean>;
    restoreStock(orderId: number, transaction?: Transaction): Promise<boolean>;
    checkStock(items: {
        productId: number;
        quantity: number;
    }[]): Promise<boolean>;
    getLowStockProducts(threshold?: number): Promise<Product[]>;
    getOutOfStockProducts(): Promise<Product[]>;
}
declare const _default: StockService;
export default _default;
//# sourceMappingURL=StockService.d.ts.map