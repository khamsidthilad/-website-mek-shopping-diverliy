import { Model, Optional } from "sequelize";
interface BillSellDetailAttributes {
    detail_id: number;
    Order_id: number | null;
    Pro_id: number | null;
    qty: number | null;
    Total: number | null;
    date: Date | null;
    image: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface BillSellDetailCreationAttributes extends Optional<BillSellDetailAttributes, "detail_id" | "Order_id" | "Pro_id" | "qty" | "Total" | "date" | "image"> {
}
declare class BillSellDetail extends Model<BillSellDetailAttributes, BillSellDetailCreationAttributes> implements BillSellDetailAttributes {
    detail_id: number;
    Order_id: number | null;
    Pro_id: number | null;
    qty: number | null;
    Total: number | null;
    date: Date | null;
    image: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default BillSellDetail;
//# sourceMappingURL=billSellDetail.model.d.ts.map