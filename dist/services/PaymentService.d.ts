declare class PaymentService {
    /**
     * Record a new payment for an order
     * @param orderId Order ID
     * @param paymentImage Path to payment receipt image
     */
    recordPayment(orderId: number, paymentImage: string): Promise<boolean>;
    /**
     * Verify a payment
     * @param orderId Order ID
     * @param status Verification status ('verified' or 'rejected')
     * @param adminId Admin user ID
     */
    verifyPayment(orderId: number, status: 'verified' | 'rejected', adminId: number): Promise<boolean>;
    /**
     * Get payment receipt file path
     * @param orderId Order ID
     */
    getPaymentReceipt(orderId: number): Promise<string | null>;
    /**
     * Calculate payment statistics
     */
    getPaymentStats(): Promise<any>;
}
declare const _default: PaymentService;
export default _default;
//# sourceMappingURL=PaymentService.d.ts.map