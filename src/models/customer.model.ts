import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface CustomerAttributes {
  cus_id: number;
  cus_name: string | null;
  Tel: string | null;
  address: string | null;
  cus_status: string | null;
  Email: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerCreationAttributes
  extends Optional<
    CustomerAttributes,
    "cus_id" | "cus_name" | "Tel" | "address" | "cus_status" | "Email"
  > {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes {
  public cus_id!: number;
  public cus_name!: string | null;
  public Tel!: string | null;
  public address!: string | null;
  public cus_status!: string | null;
  public Email!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
  {
    cus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cus_name: { type: DataTypes.STRING(150), allowNull: true },
    Tel: { type: DataTypes.STRING(20), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true },
    cus_status: { type: DataTypes.STRING(50), allowNull: true },
    Email: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    tableName: "customer",
    modelName: "Customer",
    timestamps: true,
  }
);

export default Customer;
