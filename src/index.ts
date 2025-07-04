import express, { Request, Response } from 'express';
import logger from './config/logger';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error-handler.middleware';
import { authRoutes } from './api/v1/auth/routes/auth.route';
import { productRoutes } from './api/v1/auth/routes/product.route';
import { orderRoutes } from './api/v1/auth/routes/order.route';
import { notFoundMiddleware } from './middlewares/not-found.middleware';

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Inisialisasi aplikasi Express
export const app = express();

// Morgan middleware untuk mencatat log HTTP
const morganEnvironment = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganEnvironment, {
    stream: {
        write: (message: string) => {
            logger.info(message.trim());
        },
    }
}));

// CORS middleware untuk mengizinkan permintaan dari domain tertentu
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware untuk parsing JSON dan URL-encoded data, serta cookie
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Folder for static files
app.use('/profile', express.static('public/profile'));
app.use('/products', express.static('public/products'));

// Route untuk check kesehatan server
app.use('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is healthy',
        data: {
            "ip_address": req.ip
        }
    });
});

// ROUTE API V1
const apiV1 = '/api/v1';

// Auth Routes
app.use(apiV1, authRoutes);
// Product Routes
app.use(apiV1, productRoutes);
// Order Routes
app.use(apiV1, orderRoutes);

// Middleware untuk menangani route yang tidak ditemukan
app.use(notFoundMiddleware);
// Middleware untuk menangani error
app.use(errorMiddleware);
