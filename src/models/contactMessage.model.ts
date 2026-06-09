import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

interface ContactMessageAttributes {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContactMessageCreationAttributes
  extends Omit<ContactMessageAttributes, 'id'> {}

class ContactMessage
  extends Model<ContactMessageAttributes, ContactMessageCreationAttributes>
  implements ContactMessageAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContactMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'contact_messages',
    timestamps: true,
  },
);

export default ContactMessage;
