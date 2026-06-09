// src/routes/api.ts
import express from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import customerRoutes from './customer.routes';
import categoryRoutes from './category.routes';
import orderRoutes from './order.routes';
import billRoutes from './bill.routes';
import supplierRoutes from './supplier.routes';
import importRoutes from './import.routes';
import brandRoutes from './brand.routes';
import brandCateRoutes from './brandCate.routes';
import userRoutes from './user.routes';
import contactRoutes from './contact.routes';

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running'
    });
});

router.get('/version', (req, res) => {
    res.status(200).json({
        version: '1.0.0',
        name: 'Shop API'
    });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/bills', billRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/imports', importRoutes);
router.use('/brands', brandRoutes);
router.use('/brand-category', brandCateRoutes);
router.use('/users', userRoutes);
router.use('/contact', contactRoutes);
export default router;