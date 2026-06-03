import { Model, Optional } from "sequelize";
interface UserAttributes {
    User_id: string;
    Full_Name: string | null;
    Date_of_birth: Date | null;
    Email: string | null;
    password: string | null;
    status: string | null;
    tel: string | null;
    image: string | null;
    role: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'Full_Name' | 'Date_of_birth' | 'Email' | 'password' | 'status' | 'tel' | 'image' | 'role'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    User_id: string;
    Full_Name: string | null;
    Date_of_birth: Date | null;
    Email: string | null;
    password: string | null;
    status: string | null;
    tel: string | null;
    image: string | null;
    role: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default User;
//# sourceMappingURL=user.model.d.ts.map