import { Model, Optional } from "sequelize";
/**
 * ຕາຕະລາງ orders — ລາຍການສັ່ງຊື້
 * - order_id: ລະຫັດການສັ່ງຊື້ (PK, INT)
 * - pro_id: ລະຫັດສິນຄ້າ → product.pro_id (FK)
 * - date: ວັນທີ່ (DATE)
 * - price: ລາຄາ (INT)
 * - cus_id: ລະຫັດລູກຄ້າ → customer.cus_id (FK)
 */
interface OrderAttributes {
    order_id: number;
    pro_id: number | null;
    date: Date | null;
    price: number | null;
    cus_id: number | null;
    /** ສະຖານະຊຳລະ / ຂົນສົ່ງ — ຂະບວນການຮ້ານ (ຖ້າມີໃນ DB) */
    payment_status: string | null;
    shipping_status: string | null;
    payment_image: string | null;
    tracking_number: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface OrderCreationAttributes extends Optional<OrderAttributes, "order_id" | "pro_id" | "date" | "price" | "cus_id" | "payment_status" | "shipping_status" | "payment_image" | "tracking_number"> {
}
declare class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    order_id: number;
    pro_id: number | null;
    date: Date | null;
    price: number | null;
    cus_id: number | null;
    payment_status: string | null;
    shipping_status: string | null;
    payment_image: string | null;
    tracking_number: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Order;
//# sourceMappingURL=order.model.d.ts.map