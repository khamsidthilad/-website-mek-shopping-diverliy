import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

/**
 * brand — ຍີ່ຫໍ້ສິນຄ້າ
 * - brand_id: INT PK
 * - name: VARCHAR(150)
 * - tagline: VARCHAR(255)
 * - country: VARCHAR(100)
 */
interface BrandAttributes {
  brand_id: number;
  name: string | null;
  tagline: string | null;
  country: string | null;
  brand_logo: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BrandCreationAttributes
  extends Optional<BrandAttributes, "brand_id" | "name" | "tagline" | "country" | "brand_logo"> {}

class Brand extends Model<BrandAttributes, BrandCreationAttributes>
  implements BrandAttributes {
  public brand_id!: number;
  public name!: string | null;
  public tagline!: string | null;
  public country!: string | null;
  public brand_logo!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Brand.init(
  {
    brand_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(150), allowNull: true },
    tagline: { type: DataTypes.STRING(255), allowNull: true },
    country: { type: DataTypes.STRING(100), allowNull: true },
    brand_logo: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    sequelize,
    tableName: "brand",
    modelName: "Brand",
    timestamps: true,
  },
);

export default Brand;
