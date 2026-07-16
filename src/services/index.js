import api from './api'

// Authentication Services
export const authService = {
  sendOtp: (email) => api.post('/auth/otp/send', { user_email: email }),
  verifyOtp: (email, otp) => api.post('/auth/otp/verify', { user_email: email, otp }),
}

// Dashboard Services
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
}

// Shop Type Services
export const shopTypeService = {
  getAll: (params) => api.get('/shop/type/admin', { params }),
  getById: (id) => api.get(`/shop/type/${id}`),
  create: (data) => api.post('/shop/type/create', data),
  update: (id, data) => api.put(`/shop/type/${id}`, data),
  delete: (id) => api.delete(`/shop/type/${id}`),
}

// Category Services
export const categoryService = {
  getByShopId: (shopId) => api.get(`/categories/shop_id/${shopId}`),
  getBySellerId: (sellerId) => api.get(`/categories/seller_id/${sellerId}`),
  getByShopType: (shopTypeId) => api.get(`/categories/shop_type_id/${shopTypeId}`),
  getCommon: (params) => api.get('/categories/common', { params }),
  create: (data) => api.post('/categories/create', data),
  update: (id, data) => api.patch('/categories/update', { product_category_id: id, ...data }),
  delete: (id) => api.delete(`/categories/delete/${id}`),
}

// Product Services
export const productService = {
  getCommon: (params) => api.get('/product/common', { params }),
  getCommonByCategory: (shopTypeId, params) => api.get(`/product/common/category/${shopTypeId}`, { params }),
  getBySeller: (sellerId, params) => api.get(`/product/seller/${sellerId}`, { params }),
  getByAdmin: (categoryId, params) => api.get(`/product/admin/${categoryId}`, { params }),
  create: (data) => api.post('/product/admin/create', data),
  update: (id, data) => api.patch('/product', { product_id: id, ...data }),
  delete: (id, shopId) => api.delete(`/product/delete/${id}`, { params: { shop_id: shopId } }),
}

// Seller Services
export const sellerService = {
  getAll: (params) => api.get('/user/all?user_type=seller', { params }),
  getById: (id) => api.get(`/user/seller/${id}`),
}

// Customer Services
export const customerService = {
  getAll: (params) => api.get('/user/all?user_type=customer', { params }),
  getById: (id) => api.get(`/user/customer/${id}`),
}

// Order Services
export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByStatus: (status, params) => api.get('/orders', { params: { status, ...params } }),
}

// Upload Services
export const uploadService = {
  getSignedUrl: (userId, contentType = 'image/webp') => 
    api.get(`/upload/signed/url/${userId}`, { params: { contentType } }),
}
