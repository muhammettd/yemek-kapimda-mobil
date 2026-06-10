export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: User;
  message?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Address {
  id: number;
  title: string;
  city: string;
  district: string;
  fullAddress: string;
}

export interface CreateAddressRequest {
  title: string;
  city: string;
  district: string;
  fullAddress: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  cuisine?: string;
  cuisineType?: string;
  rating?: number;
  ratingStars?: number;
  deliveryTime?: string;
  estimatedDeliveryTime?: string;
  minOrderAmount?: number;
  open?: boolean;
  isOpen?: boolean;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  restaurantId?: number;
  available?: boolean;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderCreateRequest {
  restaurantId: number;
  deliveryAddressId: number;
  items: OrderItemRequest[];
}

export interface Order {
  id?: number;
  orderId?: number;
  restaurantName?: string;
  status?: string;
  statusLabel?: string;
  totalAmount?: number;
  createdAt?: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface AuthResult {
  token: string;
  user: User;
}
