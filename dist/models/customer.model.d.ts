import { Model, Optional } from "sequelize";
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
interface CustomerCreationAttributes extends Optional<CustomerAttributes, "cus_id" | "cus_name" | "Tel" | "address" | "cus_status" | "Email"> {
}
declare class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
    cus_id: number;
    cus_name: string | null;
    Tel: string | null;
    address: string | null;
    cus_status: string | null;
    Email: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Customer;
//# sourceMappingURL=customer.model.d.ts.map