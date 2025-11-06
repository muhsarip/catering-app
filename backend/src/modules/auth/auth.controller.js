import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '../../config/database.js';
import { jwtConfig } from '../../config/jwt.js';
import AuthTransformer from './auth.transformer.js';
import { successResponse, errorResponse } from '../../shared/helpers/response.js';

const authTransformer = new AuthTransformer();

class AuthController {
  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const users = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;

      const user = users[0];

      if (!user) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      const data = {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };

      return successResponse(res, authTransformer.loginResponse(data));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const userId = req.user.id;

      const users = await sql`
        SELECT * FROM users WHERE id = ${userId}
      `;

      const user = users[0];

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, {
        user: authTransformer.user({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        })
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res) {
    // JWT is stateless, logout is handled client-side
    return successResponse(res, { message: 'Logged out successfully' });
  }
}

export default new AuthController();
