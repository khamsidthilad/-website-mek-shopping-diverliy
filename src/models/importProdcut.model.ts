import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
/**
 * purchase (import product) — ການສັ່ງຊື້ສິນຄ້າເຂົ້າຮ້ານ
 * - Purchase_id: INT(10) PK
 * - user_id: VARCHAR(50) FK → user.User_id
 */
interface PurchaseAttributes {
  Purchase_id: number;
  user_id: string | null;
  pro_id: number | null;
  sup_id: number | null;
  quantity: number | null;
  price: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PurchaseCreationAttributes
  extends Optional<
    PurchaseAttributes,
    "Purchase_id" | "user_id" | "pro_id" | "sup_id" | "quantity" | "price"
  > {}

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes>
  implements PurchaseAttributes {
  public Purchase_id!: number;
  public user_id!: string | null;
  public pro_id!: number | null;
  public sup_id!: number | null;
  public quantity!: number | null;
  public price!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Purchase.init(
  {
    Purchase_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: { model: "user", key: "User_id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    pro_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "product", key: "pro_id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    sup_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "supplier", key: "sup_id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "purchase",
    modelName: "Purchase",
    timestamps: true,
  },
);

export default Purchase;
