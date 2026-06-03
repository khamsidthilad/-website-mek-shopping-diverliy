import { Model, Optional } from "sequelize";
/**
 * supplier — ຜູ້ຂາຍ / Supplier
 * - sup_id: INT(10) PK ລະຫັດຜູ້ຂາຍ
 * - name: VARCHAR(50) ຊື່ຜູ້ຂາຍ
 * - Tel: INT(15) ເບີໂທ
 * - address: VARCHAR(100) ທີ່ຢູ່
 * - pro_id: INT(10) FK → product.pro_id ລະຫັດສິນຄ້າ
 */
interface SupplierAttributes {
    sup_id: number;
    name: string | null;
    Tel: string | null;
    address: string | null;
    pro_id: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface SupplierCreationAttributes extends Optional<SupplierAttributes, "sup_id" | "name" | "Tel" | "address" | "pro_id"> {
}
declare class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
    sup_id: number;
    name: string | null;
    Tel: string | null;
    address: string | null;
    pro_id: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Supplier;
//# sourceMappingURL=supplier.model.d.ts.map