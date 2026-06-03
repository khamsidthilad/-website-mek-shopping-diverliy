"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
class StockService {
    async reduceStock(orderId, transaction) {
        try {
            const t = transaction || await models_1.sequelize.transaction();
            try {
                const billDetails = await models_1.BillSellDetail.findAll({
                    where: { Order_id: orderId },
                    transaction: t
                });
                for (const detail of billDetails) {
                    const product = await models_1.Product.findByPk(detail.Pro_id, { transaction: t });
                    if (!product) {
                        throw new Error(`Product with ID ${detail.Pro_id} not found`);
                    }
                    const quantityToReduce = detail.qty || 1;
                    const currentStock = product.pro_qty || 0;
                    if (currentStock < quantityToReduce) {
                        throw new Error(`Insufficient stock for product ${product.pro_name}`);
                    }
                    await product.update({ pro_qty: currentStock - quantityToReduce }, { transaction: t });
                }
                if (!transaction) {
                    await t.commit();
                }
                return true;
            }
            catch (error) {
                if (!transaction) {
                    await t.rollback();
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error reducing stock:', error);
            return false;
        }
    }
    async restoreStock(orderId, transaction) {
        try {
            const t = transaction || await models_1.sequelize.transaction();
            try {
                const billDetails = await models_1.BillSellDetail.findAll({
                    where: { Order_id: orderId },
                    transaction: t
                });
                for (const detail of billDetails) {
                    const product = await models_1.Product.findByPk(detail.Pro_id, { transaction: t });
                    if (!product) {
                        throw new Error(`Product with ID ${detail.Pro_id} not found`);
                    }
                    const quantityToRestore = detail.qty || 1;
                    const currentStock = product.pro_qty || 0;
                    await product.update({ pro_qty: currentStock + quantityToRestore }, { transaction: t });
                }
                if (!transaction) {
                    await t.commit();
                }
                return true;
            }
            catch (error) {
                if (!transaction) {
                    await t.rollback();
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error restoring stock:', error);
            return false;
        }
    }
    async checkStock(items) {
        try {
            for (const item of items) {
                const product = await models_1.Product.findByPk(item.productId);
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`);
                }
                if ((product.pro_qty || 0) < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.pro_name}`);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Error checking stock:', error);
            return false;
        }
    }
    async getLowStockProducts(threshold = 5) {
        try {
            const products = await models_1.Product.findAll({
                where: {
                    pro_qty: {
                        [sequelize_1.Op.lt]: threshold,
                        [sequelize_1.Op.gt]: 0
                    }
                }
            });
            return products;
        }
        catch (error) {
            console.error('Error getting low stock products:', error);
            return [];
        }
    }
    async getOutOfStockProducts() {
        try {
            const products = await models_1.Product.findAll({
                where: {
                    pro_qty: {
                        [sequelize_1.Op.lte]: 0
                    }
                }
            });
            return products;
        }
        catch (error) {
            console.error('Error getting out of stock products:', error);
            return [];
        }
    }
}
exports.default = new StockService();
//# sourceMappingURL=StockService.js.map