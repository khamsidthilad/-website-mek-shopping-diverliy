import { Model, Optional } from "sequelize";
/**
 * purchase (import product) — ການສັ່ງຊື້ສິນຄ້າເຂົ້າຮ້ານ
 * - Purchase_id: INT(10) PK
 * - user_id: VARCHAR(50) FK → user.User_id
 */
interface PurchaseAttributes {
    Purchase_id: number;
    user_id: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, "Purchase_id" | "user_id"> {
}
declare class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
    Purchase_id: number;
    user_id: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Purchase;
//# sourceMappingURL=importProdcut.model.d.ts.map