import { sql } from '../../config/database.js';
import MenuTransformer from './menu.transformer.js';
import { successResponse, errorResponse } from '../../shared/helpers/response.js';

const menuTransformer = new MenuTransformer();

class MenuController {
  /**
   * Get all available menu items with filters
   * GET /api/menu-items
   */
  async getAll(req, res, next) {
    try {
      const { cateringServiceId, category } = req.query;

      let menuItems;

      // Build query based on filters
      if (cateringServiceId && category) {
        // Both filters
        menuItems = await sql`
          SELECT mi.*, cs.name as catering_service_name
          FROM menu_items mi
          LEFT JOIN catering_services cs ON mi.catering_service_id = cs.id
          WHERE mi.is_available = true
            AND mi.catering_service_id = ${cateringServiceId}
            AND mi.category = ${category}
          ORDER BY cs.name, mi.category, mi.name
        `;
      } else if (cateringServiceId) {
        // Only catering service filter
        menuItems = await sql`
          SELECT mi.*, cs.name as catering_service_name
          FROM menu_items mi
          LEFT JOIN catering_services cs ON mi.catering_service_id = cs.id
          WHERE mi.is_available = true
            AND mi.catering_service_id = ${cateringServiceId}
          ORDER BY cs.name, mi.category, mi.name
        `;
      } else if (category) {
        // Only category filter
        menuItems = await sql`
          SELECT mi.*, cs.name as catering_service_name
          FROM menu_items mi
          LEFT JOIN catering_services cs ON mi.catering_service_id = cs.id
          WHERE mi.is_available = true
            AND mi.category = ${category}
          ORDER BY cs.name, mi.category, mi.name
        `;
      } else {
        // No filters
        menuItems = await sql`
          SELECT mi.*, cs.name as catering_service_name
          FROM menu_items mi
          LEFT JOIN catering_services cs ON mi.catering_service_id = cs.id
          WHERE mi.is_available = true
          ORDER BY cs.name, mi.category, mi.name
        `;
      }

      return successResponse(res, {
        menuItems: menuTransformer.menuItemsList(menuItems),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get menu item by ID
   * GET /api/menu-items/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const menuItems = await sql`
        SELECT mi.*, cs.name as catering_service_name
        FROM menu_items mi
        LEFT JOIN catering_services cs ON mi.catering_service_id = cs.id
        WHERE mi.id = ${id}
      `;

      const menuItem = menuItems[0];

      if (!menuItem) {
        return errorResponse(res, 'Menu item not found', 404);
      }

      return successResponse(res, {
        menuItem: menuTransformer.menuItem(menuItem),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MenuController();
