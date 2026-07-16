export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/otp/send',
    VERIFY_OTP: '/auth/otp/verify',
  },
  DASHBOARD: '/dashboard',
  SHOP_TYPES: '/shop/type',
  CATEGORIES: '/categories',
  PRODUCTS: '/product',
  SELLERS: '/user/all?user_type=seller',
  CUSTOMERS: '/user/all?user_type=customer',
  ORDERS: '/orders',
  UPLOAD: '/upload/signed/url',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
}

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
}

export const SELLER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
}
