import { Model, Optional } from "sequelize";
/**
 * purchase (import product) — ການສັ່ງຊື້ສິນຄ້າເຂົ້າຮ້ານ
 * - Purchase_id: INT(10) PK
 * - user_id: VARCHAR(50) FK → user.User_id
 */
interface PurchaseAttributes {
    Purchase_id: number;
    user_id: string | null;
    pro_id: number | null;
    sup_id: number | null;
    quantity: number | null;
    price: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, "Purchase_id" | "user_id" | "pro_id" | "sup_id" | "quantity" | "price"> {
}
declare class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
    Purchase_id: number;
    user_id: string | null;
    pro_id: number | null;
    sup_id: number | null;
    quantity: number | null;
    price: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Purchase;
//# sourceMappingURL=importProdcut.model.d.ts.map