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
  createdAt?: Date;
  updatedAt?: Date;
}

interface PurchaseCreationAttributes
  extends Optional<PurchaseAttributes, "Purchase_id" | "user_id"> {}

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes>
  implements PurchaseAttributes {
  public Purchase_id!: number;
  public user_id!: string | null;
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
  },
  {
    sequelize,
    tableName: "purchase",
    modelName: "Purchase",
    timestamps: true,
  },
);

export default Purchase;
