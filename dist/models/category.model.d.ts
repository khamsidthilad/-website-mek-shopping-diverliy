import { Model, Optional } from "sequelize";
interface CategoryAttributes {
    cate_id: number;
    cate_name: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface CategoryCreationAttributes extends Optional<CategoryAttributes, "cate_id" | "cate_name"> {
}
declare class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    cate_id: number;
    cate_name: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Category;
//# sourceMappingURL=category.model.d.ts.map