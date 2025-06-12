import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import syncRoutes from './routes/sync';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import currencyRoutes from './routes/currencyRoutes';
import orderRoutes from './routes/orderRoutes';
import priceRoutes from './routes/prices';
import expenseRoutes from './routes/expenseRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import telegramRoutes from './routes/telegramRoutes';

// Загружаем переменные окружения
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', syncRoutes);
app.use('/api/user', userRoutes);
app.use('/api', productRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api', orderRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api', expenseRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/telegram', telegramRoutes);

// Статические файлы для загруженных изображений
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default app;
