import { Model, Optional } from "sequelize";
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
interface BrandCreationAttributes extends Optional<BrandAttributes, "brand_id" | "name" | "tagline" | "country" | "brand_logo"> {
}
declare class Brand extends Model<BrandAttributes, BrandCreationAttributes> implements BrandAttributes {
    brand_id: number;
    name: string | null;
    tagline: string | null;
    country: string | null;
    brand_logo: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Brand;
//# sourceMappingURL=brand.model.d.ts.map