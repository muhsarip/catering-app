import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

// Import module routes
import authRoutes from './modules/auth/auth.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import cateringRoutes from './modules/catering/catering.routes.js';
import menuRoutes from './modules/menu/menu.routes.js';

/**
 * Create and configure Express application
 */
const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint (no auth required)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes (no /api prefix because function is already named 'api')
  app.use('/auth', authRoutes);
  app.use('/orders', ordersRoutes);
  app.use('/catering-services', cateringRoutes);
  app.use('/menu-items', menuRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
      path: req.path,
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
