import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan'
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/db';
import apiRoutes from './routes/api.routes';

dotenv.config();

const app = express();

testConnection();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Express 5 (path-to-regexp) does not accept bare '*'
app.options(/.*/, cors());

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Shop API Server is running');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

export default app;
