import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.instance.interceptors.request.use((config) => {
      let token = null;
      if (typeof window !== 'undefined') {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            token = parsed.state?.token;
          } catch (e) {
            console.error('Failed to parse auth-storage', e);
          }
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            // Avoid full page reload to improve UX during cart actions
            // window.location.reload(); 
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  login(email: string, password: string) {
    return this.instance.post('/auth/login', { email, password });
  }

  register(email: string, password: string, firstName: string, lastName: string) {
    return this.instance.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
  }

  // Products endpoints
  getProducts(page = 1, limit = 20, filters?: any) {
    return this.instance.get('/products', {
      params: { page, limit, ...filters },
    });
  }

  getProductBySlug(slug: string) {
    return this.instance.get(`/products/${slug}`);
  }

  getProductById(id: string) {
    return this.instance.get(`/products/${id}`);
  }

  createProduct(data: any) {
    return this.instance.post('/products', data);
  }

  updateProduct(id: string, data: any) {
    return this.instance.put(`/products/${id}`, data);
  }

  deleteProduct(id: string) {
    return this.instance.delete(`/products/${id}`);
  }

  // Cart endpoints
  getCart() {
    return this.instance.get('/cart');
  }

  addToCart(productId: string, quantity: number) {
    return this.instance.post('/cart', { productId, quantity });
  }

  updateCartItem(productId: string, quantity: number) {
    return this.instance.patch(`/cart/${productId}`, { quantity });
  }

  removeFromCart(productId: string) {
    return this.instance.delete(`/cart/${productId}`);
  }

  clearCart() {
    return this.instance.delete('/cart');
  }

  // Orders endpoints
  getHistory() {
    return this.instance.get('/orders/history');
  }

  getOrderById(id: string) {
    return this.instance.get(`/orders/${id}`);
  }

  createOrder(data: any) {
    return this.instance.post('/orders', data);
  }

  updateOrder(id: string, data: any) {
    return this.instance.put(`/orders/${id}`, data);
  }

  getAllOrders() {
    return this.instance.get('/orders/all');
  }

  updateOrderStatus(id: string, data: { status: string; trackingNumber?: string; trackingUrl?: string }) {
    return this.instance.post(`/orders/${id}/status`, data);
  }

  // Reviews endpoints
  getProductReviews(productId: string) {
    return this.instance.get(`/reviews/product/${productId}`);
  }

  // Promotions endpoints
  validateDiscount(code: string, amount: number) {
    return this.instance.post(`/promotions/validate?code=${code}&amount=${amount}`);
  }

  // Categories endpoints
  getCategories() {
    return this.instance.get('/categories');
  }

  getCategoryById(id: string) {
    return this.instance.get(`/categories/${id}`);
  }

  createCategory(data: any) {
    return this.instance.post('/categories', data);
  }

  updateCategory(id: string, data: any) {
    return this.instance.put(`/categories/${id}`, data);
  }

  deleteCategory(id: string) {
    return this.instance.delete(`/categories/${id}`);
  }

  // Reviews endpoints
  getReviews(page = 1, limit = 10) {
    return this.instance.get('/reviews', { params: { page, limit } });
  }

  getReviewsByProduct(productId: string, page = 1, limit = 10) {
    return this.instance.get(`/reviews/product/${productId}`, { params: { page, limit } });
  }

  createReview(productId: string, data: any) {
    return this.instance.post('/reviews', { ...data, productId });
  }

  deleteReviewAdmin(id: string) {
    return this.instance.delete(`/reviews/admin/${id}`);
  }

  // Wishlist endpoints
  getWishlist() {
    return this.instance.get('/wishlist');
  }

  addToWishlist(productId: string) {
    return this.instance.post('/wishlist/add', { productId });
  }

  removeFromWishlist(productId: string) {
    return this.instance.delete(`/wishlist/remove/${productId}`);
  }

  // Users endpoints
  getProfile() {
    return this.instance.get('/users/profile');
  }

  updateProfile(data: any) {
    return this.instance.put('/users/profile', data);
  }

  getAllUsers() {
    return this.instance.get('/users');
  }

  getUserById(id: string) {
    return this.instance.get(`/users/${id}`);
  }

  createUser(data: any) {
    return this.instance.post('/users', data);
  }

  updateUser(id: string, data: any) {
    return this.instance.patch(`/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.instance.delete(`/users/${id}`);
  }

  // Discounts endpoints
  getDiscounts() {
    return this.instance.get('/promotions');
  }

  getDiscountById(id: string) {
    return this.instance.get(`/promotions/${id}`);
  }

  createDiscount(data: any) {
    return this.instance.post('/promotions', data);
  }

  updateDiscount(id: string, data: any) {
    return this.instance.put(`/promotions/${id}`, data);
  }

  deleteDiscount(id: string) {
    return this.instance.delete(`/promotions/${id}`);
  }

  applyDiscount(code: string) {
    return this.instance.post('/promotions/apply', { code });
  }

  // Analytics endpoints
  getDashboardStats() {
    return this.instance.get('/analytics/dashboard');
  }

  getDashboardMetrics() {
    return this.instance.get('/analytics/metrics');
  }

  getTopSellingProducts(limit = 10) {
    return this.instance.get('/analytics/top-selling', { params: { limit } });
  }

  getOrderStats(days = 30) {
    return this.instance.get('/analytics/orders', { params: { days } });
  }

  getRecentOrders() {
    return this.instance.get('/analytics/recent-orders');
  }
  
  // Payments endpoints
  createPaymentSession(paymentMethod: string, orderId: string) {
    return this.instance.post('/payments/create-session', {
      paymentMethod,
      orderId,
    });
  }

  capturePayment(orderId: string) {
    return this.instance.post('/payments/paypal/capture', { orderId });
  }

  // Upload endpoints
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.instance.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.instance.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiClient = new ApiClient();
