import { sequelize } from "../config/db";
import User from "./user.model";
import Customer from "./customer.model";
import Product from "./product.model";
import Order from "./order.model";
import BillSellDetail from "./billSellDetail.model";
import Category from "./category.model";
import Supplier from "./supplier.model";
import Purchase from "./importProdcut.model";
import Diverily from "./diverily.model";

Order.belongsTo(Customer, { foreignKey: "cus_id", as: "customer" });
Customer.hasMany(Order, { foreignKey: "cus_id", as: "orders" });

Order.hasMany(BillSellDetail, { foreignKey: "Order_id", as: "billDetails" });
BillSellDetail.belongsTo(Order, { foreignKey: "Order_id", as: "order" });

BillSellDetail.belongsTo(Product, { foreignKey: "Pro_id", as: "product" });
Category.hasMany(Product, { foreignKey: "cate_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "cate_id", as: "category" });

Product.hasMany(Supplier, { foreignKey: "pro_id", as: "suppliers" });
Supplier.belongsTo(Product, { foreignKey: "pro_id", as: "product" });

User.hasMany(Purchase, { foreignKey: "user_id", as: "purchases" });
Purchase.belongsTo(User, { foreignKey: "user_id", as: "user" });

Diverily.belongsTo(User, { foreignKey: "user_id", as: "user" });

export {
  sequelize,
  User,
  Customer,
  Product,
  Order,
  BillSellDetail,
  Category,
  Supplier,
  Purchase, Diverily,
};

