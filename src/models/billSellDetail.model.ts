import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface BillSellDetailAttributes {
  detail_id: number;
  Order_id: number | null;
  Pro_id: number | null;
  qty: number | null;
  Total: number | null;
  date: Date | null;
  image: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BillSellDetailCreationAttributes extends Optional<
  BillSellDetailAttributes,
  "detail_id" | "Order_id" | "Pro_id" | "qty" | "Total" | "date" | "image"
> {}

class BillSellDetail
  extends Model<BillSellDetailAttributes, BillSellDetailCreationAttributes>
  implements BillSellDetailAttributes
{
  public detail_id!: number;
  public Order_id!: number | null;
  public Pro_id!: number | null;
  public qty!: number | null;
  public Total!: number | null;
  public date!: Date | null;
  public image!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BillSellDetail.init(
  {
    detail_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    Order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    Pro_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    qty: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    Total: { type: DataTypes.INTEGER, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: true },
    image: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    sequelize,
    tableName: "bill_sell_detail",
    modelName: "BillSellDetail",
    timestamps: true,
  },
);

export default BillSellDetail;
