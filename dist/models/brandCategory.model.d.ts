import { Model } from "sequelize";
/**
 * brand_category — ความสัมพันธ์ many-to-many ระหว่าง brand กับ category
 */
declare class BrandCategory extends Model {
    brand_id: number;
    cate_id: number;
}
export default BrandCategory;
//# sourceMappingURL=brandCategory.model.d.ts.map