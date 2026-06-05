import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

/**
 * brand_category — ความสัมพันธ์ many-to-many ระหว่าง brand กับ category
 */
class BrandCategory extends Model {
  public brand_id!: number;
  public cate_id!: number;
}

BrandCategory.init(
  {
    brand_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: { model: "brand", key: "brand_id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    cate_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: { model: "category", key: "cate_id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "brand_category",
    modelName: "BrandCategory",
    timestamps: false,
  },
);

export default BrandCategory;
