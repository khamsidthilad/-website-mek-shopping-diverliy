import { Product, BillSellDetail, sequelize } from '../models';
import { Transaction } from 'sequelize';
import { Op } from 'sequelize';

class StockService {
    public async reduceStock(orderId: number, transaction?: Transaction): Promise<boolean> {
        try {
            const t = transaction || await sequelize.transaction();

            try {
                const billDetails = await BillSellDetail.findAll({
                    where: { Order_id: orderId },
                    transaction: t
                });

                for (const detail of billDetails) {
                    const product = await Product.findByPk(detail.Pro_id!, { transaction: t });

                    if (!product) {
                        throw new Error(`Product with ID ${detail.Pro_id} not found`);
                    }

                    const quantityToReduce = detail.qty || 1;
                    const currentStock = product.pro_qty || 0;

                    if (currentStock < quantityToReduce) {
                        throw new Error(`Insufficient stock for product ${product.pro_name}`);
                    }

                    await product.update(
                        { pro_qty: currentStock - quantityToReduce },
                        { transaction: t }
                    );
                }

                if (!transaction) {
                    await t.commit();
                }

                return true;
            } catch (error) {
                if (!transaction) {
                    await t.rollback();
                }

                throw error;
            }
        } catch (error) {
            console.error('Error reducing stock:', error);
            return false;
        }
    }

    public async restoreStock(orderId: number, transaction?: Transaction): Promise<boolean> {
        try {
            const t = transaction || await sequelize.transaction();

            try {
                const billDetails = await BillSellDetail.findAll({
                    where: { Order_id: orderId },
                    transaction: t
                });

                for (const detail of billDetails) {
                    const product = await Product.findByPk(detail.Pro_id!, { transaction: t });

                    if (!product) {
                        throw new Error(`Product with ID ${detail.Pro_id} not found`);
                    }

                    const quantityToRestore = detail.qty || 1;
                    const currentStock = product.pro_qty || 0;

                    await product.update(
                        { pro_qty: currentStock + quantityToRestore },
                        { transaction: t }
                    );
                }

                if (!transaction) {
                    await t.commit();
                }

                return true;
            } catch (error) {
                if (!transaction) {
                    await t.rollback();
                }

                throw error;
            }
        } catch (error) {
            console.error('Error restoring stock:', error);
            return false;
        }
    }

    public async checkStock(items: { productId: number; quantity: number }[]): Promise<boolean> {
        try {
            for (const item of items) {
                const product = await Product.findByPk(item.productId);

                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`);
                }

                if ((product.pro_qty || 0) < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.pro_name}`);
                }
            }

            return true;
        } catch (error) {
            console.error('Error checking stock:', error);
            return false;
        }
    }

    public async getLowStockProducts(threshold: number = 5): Promise<Product[]> {
        try {
            const products = await Product.findAll({
                where: {
                    pro_qty: {
                        [Op.lt]: threshold,
                        [Op.gt]: 0
                    }
                }
            });

            return products;
        } catch (error) {
            console.error('Error getting low stock products:', error);
            return [];
        }
    }

    public async getOutOfStockProducts(): Promise<Product[]> {
        try {
            const products = await Product.findAll({
                where: {
                    pro_qty: {
                        [Op.lte]: 0
                    }
                }
            });

            return products;
        } catch (error) {
            console.error('Error getting out of stock products:', error);
            return [];
        }
    }
}

export default new StockService();
