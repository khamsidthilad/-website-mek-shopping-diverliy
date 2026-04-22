import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

interface DiverilyAttributes {
  Deli_id: number;
  user_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DiverilyCreationAttributes extends Omit<
  DiverilyAttributes,
  "Deli_id"
> {}

class Diverily
  extends Model<DiverilyAttributes, DiverilyCreationAttributes>
  implements DiverilyAttributes
{
  public Deli_id!: number;
  public user_id!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Diverily.init(
  {
    Deli_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "Delivery ID (ລະຫດ ການຈດ ສ່ງົສິນຄາ້)",
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "User ID (ລະຫດ ຜໃູ້ຊງ້ານ)",
      references: {
        model: "user",
        key: "User_id",
      },
    },
  },
  {
    sequelize: sequelize,
    tableName: "delivery",
    timestamps: true,
  },
);

export default Diverily;
