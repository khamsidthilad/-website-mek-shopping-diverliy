import { Model } from 'sequelize';
interface ContactMessageAttributes {
    id: number;
    name: string;
    email: string;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ContactMessageCreationAttributes extends Omit<ContactMessageAttributes, 'id'> {
}
declare class ContactMessage extends Model<ContactMessageAttributes, ContactMessageCreationAttributes> implements ContactMessageAttributes {
    id: number;
    name: string;
    email: string;
    message: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default ContactMessage;
//# sourceMappingURL=contactMessage.model.d.ts.map