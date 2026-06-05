import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface ProductAttributes {
  pro_id: number;
  pro_name: string | null;
  pro_detail: string | null;
  pro_price: number | null;
  pro_image: string | null;
  pro_qty: number | null;
  cate_id: number | null;
  brand_id: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes
  extends Optional<
    ProductAttributes,
    "pro_id" | "pro_name" | "pro_price" | "pro_image" | "pro_qty" | "cate_id" | "brand_id"
  > {}

class Product extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes {
  public pro_id!: number;
  public pro_name!: string | null;
  public pro_detail!: string | null;
  public pro_price!: number | null;
  public pro_image!: string | null;
  public pro_qty!: number | null;
  public cate_id!: number | null;
  public brand_id!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    pro_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    pro_name: { type: DataTypes.STRING(255), allowNull: true },
    pro_detail: { type: DataTypes.STRING(500), allowNull: true },
    pro_price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    pro_image: { type: DataTypes.STRING(500), allowNull: true },
    pro_qty: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, defaultValue: 0 },
    cate_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    brand_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "brand", key: "brand_id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "product",
    modelName: "Product",
    timestamps: true,
  }
);

export default Product;
