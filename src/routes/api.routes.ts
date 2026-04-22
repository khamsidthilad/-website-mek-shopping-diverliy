// src/routes/api.ts
import express from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';

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
export default router;