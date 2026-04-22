import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface CategoryAttributes {
    cate_id: number;
    cate_name: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CategoryCreationAttributes
  extends Optional<
    CategoryAttributes,
    "cate_id" | "cate_name"
  > {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes {
  public cate_id!: number;
  public cate_name!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    cate_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cate_name: { type: DataTypes.STRING(150), allowNull: true },
  },
  {
    sequelize,
    tableName: "category",
    modelName: "Category",
    timestamps: true,
  }
);

export default Category;
