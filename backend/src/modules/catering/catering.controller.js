import { sql } from '../../config/database.js';
import CateringTransformer from './catering.transformer.js';
import { successResponse, errorResponse } from '../../shared/helpers/response.js';

const cateringTransformer = new CateringTransformer();

class CateringController {
  /**
   * Get all active catering services
   * GET /api/catering-services
   */
  async getAll(req, res, next) {
    try {
      const cateringServices = await sql`
        SELECT * FROM catering_services
        WHERE is_active = true
        ORDER BY name
      `;

      return successResponse(res, {
        cateringServices: cateringTransformer.cateringServicesList(cateringServices),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get catering service by ID
   * GET /api/catering-services/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const cateringServices = await sql`
        SELECT * FROM catering_services
        WHERE id = ${id}
      `;

      const cateringService = cateringServices[0];

      if (!cateringService) {
        return errorResponse(res, 'Catering service not found', 404);
      }

      return successResponse(res, {
        cateringService: cateringTransformer.cateringService(cateringService),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CateringController();
