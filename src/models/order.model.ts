import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

/**
 * ຕາຕະລາງ orders — ລາຍການສັ່ງຊື້
 * - order_id: ລະຫັດການສັ່ງຊື້ (PK, INT)
 * - pro_id: ລະຫັດສິນຄ້າ → product.pro_id (FK)
 * - date: ວັນທີ່ (DATE)
 * - price: ລາຄາ (INT)
 * - cus_id: ລະຫັດລູກຄ້າ → customer.cus_id (FK)
 */
interface OrderAttributes {
  order_id: number;
  pro_id: number | null;
  date: Date | null;
  price: number | null;
  cus_id: number | null;
  /** ສະຖານະຊຳລະ / ຂົນສົ່ງ — ຂະບວນການຮ້ານ (ຖ້າມີໃນ DB) */
  payment_status: string | null;
  shipping_status: string | null;
  payment_image: string | null;
  tracking_number: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    | "order_id"
    | "pro_id"
    | "date"
    | "price"
    | "cus_id"
    | "payment_status"
    | "shipping_status"
    | "payment_image"
    | "tracking_number"
  > {}

class Order extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes {
  public order_id!: number;
  public pro_id!: number | null;
  public date!: Date | null;
  public price!: number | null;
  public cus_id!: number | null;
  public payment_status!: string | null;
  public shipping_status!: string | null;
  public payment_image!: string | null;
  public tracking_number!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const int10Pk = {
  type: DataTypes.INTEGER.UNSIGNED,
  autoIncrement: true,
  primaryKey: true,
  comment: "ລະຫັດການສັ່ງຊື້",
};

const int10Fk = {
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull: true,
};

Order.init(
  {
    order_id: int10Pk,
    pro_id: {
      ...int10Fk,
      references: { model: "product", key: "pro_id" },
      comment: "ລະຫັດສິນຄ້າ (FK → product)",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ວັນທີ່",
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ລາຄາ",
    },
    cus_id: {
      ...int10Fk,
      references: { model: "customer", key: "cus_id" },
      comment: "ລະຫັດລູກຄ້າ (FK → customer)",
    },
    payment_status: { type: DataTypes.STRING(50), allowNull: true },
    shipping_status: { type: DataTypes.STRING(50), allowNull: true },
    payment_image: { type: DataTypes.STRING(500), allowNull: true },
    tracking_number: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    tableName: "orders",
    modelName: "Order",
    timestamps: true,
  }
);

export default Order;
