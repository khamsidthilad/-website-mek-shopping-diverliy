import { Order } from '../models';
interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
}
interface OrderData {
    customerId: number;
    items: OrderItem[];
    totalPrice: number;
    shippingAddress?: string;
    shippingNote?: string;
}
declare class OrderService {
    /**
     * Create a new order
     * @param orderData Order data
     */
    createOrder(orderData: OrderData): Promise<Order | null>;
    /**
     * Get order details with products and customer information
     * @param orderId Order ID
     */
    getOrderDetails(orderId: number): Promise<Order | null>;
    /**
     * Cancel an order
     * @param orderId Order ID
     */
    cancelOrder(orderId: number): Promise<boolean>;
    /**
     * Update shipping status
     * @param orderId Order ID
     * @param status New shipping status
     * @param trackingNumber Tracking number (optional)
     */
    updateShippingStatus(orderId: number, status: 'processing' | 'shipped' | 'delivered' | 'cancelled', trackingNumber?: string): Promise<boolean>;
    /**
     * Get orders by customer
     * @param customerId Customer ID
     */
    getCustomerOrders(customerId: number): Promise<Order[]>;
    /**
     * Get orders by shipping status
     * @param status Shipping status
     */
    getOrdersByShippingStatus(status: string): Promise<Order[]>;
    /**
     * Get all orders with pagination
     * @param page Page number
     * @param limit Items per page
     */
    getAllOrders(page?: number, limit?: number): Promise<{
        orders: Order[];
        total: number;
        pages: number;
    }>;
    /**
     * Get order statistics
     */
    getOrderStats(): Promise<any>;
}
declare const _default: OrderService;
export default _default;
//# sourceMappingURL=OrderService.d.ts.map