import BaseTransformer from '../../shared/transformers/base.transformer.js';

class MenuTransformer extends BaseTransformer {
  /**
   * Transform single menu item
   */
  menuItem(item) {
    if (!item) return null;

    return {
      id: item.id,
      cateringServiceId: item.catering_service_id,
      cateringServiceName: item.catering_service_name,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      category: item.category,
      isAvailable: item.is_available,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  /**
   * Transform menu items list
   */
  menuItemsList(items) {
    return items.map(item => this.menuItem(item));
  }
}

export default MenuTransformer;
