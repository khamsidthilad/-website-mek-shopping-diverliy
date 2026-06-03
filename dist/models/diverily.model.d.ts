import { Model } from "sequelize";
interface DiverilyAttributes {
    Deli_id: number;
    user_id: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface DiverilyCreationAttributes extends Omit<DiverilyAttributes, "Deli_id"> {
}
declare class Diverily extends Model<DiverilyAttributes, DiverilyCreationAttributes> implements DiverilyAttributes {
    Deli_id: number;
    user_id: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Diverily;
//# sourceMappingURL=diverily.model.d.ts.map