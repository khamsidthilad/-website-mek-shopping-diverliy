import { Model, Optional } from "sequelize";
interface ProductAttributes {
    pro_id: number;
    pro_name: string | null;
    pro_detail: string | null;
    pro_price: number | null;
    pro_image: string | null;
    pro_qty: number | null;
    cate_id: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ProductCreationAttributes extends Optional<ProductAttributes, "pro_id" | "pro_name" | "pro_price" | "pro_image" | "pro_qty" | "cate_id"> {
}
declare class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    pro_id: number;
    pro_name: string | null;
    pro_detail: string | null;
    pro_price: number | null;
    pro_image: string | null;
    pro_qty: number | null;
    cate_id: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Product;
//# sourceMappingURL=product.model.d.ts.map