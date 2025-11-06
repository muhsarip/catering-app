export interface CateringService {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  cateringServiceId: string;
  cateringServiceName?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}
