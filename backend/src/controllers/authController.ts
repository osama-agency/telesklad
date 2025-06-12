import type { Request, Response } from 'express';

// Базовый AuthController для совместимости
export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Простая проверка для демо
      if (username === 'admin' && password === 'admin') {
        res.json({
          success: true,
          token: 'demo-token',
          user: { id: 1, username: 'admin' }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        user: { id: 1, username: 'admin' }
      });
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user info'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }
}

// CommonJS экспорты для совместимости с routes
module.exports = {
  login: AuthController.login,
  me: AuthController.me,
  logout: AuthController.logout
};
