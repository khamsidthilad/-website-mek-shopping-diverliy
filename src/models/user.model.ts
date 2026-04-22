import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import bcrypt from 'bcrypt';
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

interface UserCreationAttributes extends Optional<UserAttributes, 'Full_Name' | 'Date_of_birth' | 'Email' | 'password' | 'status' | 'tel' | 'image' | 'role'> {}

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public User_id!: string;
  public Full_Name!: string | null;
  public Date_of_birth!: Date | null;
  public Email!: string | null;
  public password!: string | null;
  public status!: string | null;
  public tel!: string | null;
  public image!: string | null;
  public role!: string | null;
  
  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
        User_id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
        },
        Full_Name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        Date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        Email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        tel: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'customer',
        },
    },
    {
        sequelize,
        tableName: 'user',
        modelName: 'User',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password') && user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
        },
    }
);

export default User;