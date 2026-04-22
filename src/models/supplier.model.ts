import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

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

interface SupplierCreationAttributes
  extends Optional<
    SupplierAttributes,
    "sup_id" | "name" | "Tel" | "address" | "pro_id"
  > {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes>
  implements SupplierAttributes {
  public sup_id!: number;
  public name!: string | null;
  public Tel!: string | null;
  public address!: string | null;
  public pro_id!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Supplier.init(
  {
    sup_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: "ລະຫັດຜູ້ຂາຍ",
    },
    name: { type: DataTypes.STRING(50), allowNull: true },
    Tel: { type: DataTypes.STRING(15), allowNull: true },
    address: { type: DataTypes.STRING(100), allowNull: true },
    pro_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "product", key: "pro_id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "supplier",
    modelName: "Supplier",
    timestamps: true,
  },
);

export default Supplier;
