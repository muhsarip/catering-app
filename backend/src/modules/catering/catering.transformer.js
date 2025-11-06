import BaseTransformer from '../../shared/transformers/base.transformer.js';

class CateringTransformer extends BaseTransformer {
  /**
   * Transform single catering service
   */
  cateringService(service) {
    if (!service) return null;

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      isActive: service.is_active,
      createdAt: service.created_at,
      updatedAt: service.updated_at,
    };
  }

  /**
   * Transform catering services list
   */
  cateringServicesList(services) {
    return services.map(service => this.cateringService(service));
  }
}

export default CateringTransformer;
