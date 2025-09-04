import api from './api';

export interface Product {
  id: number;
  name: string;
  targetPrice: number;
  url: string;
  currentLowestPrice?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: number;
  productId: number;
  site: string;
  price: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  targetPrice: number;
  url: string;
}

export interface UpdateProductRequest {
  name?: string;
  targetPrice?: number;
  url?: string;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/product/list');
    return response.data;
  },

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await api.post('/product/add', productData);
    return response.data;
  },

  async updateProduct(id: number, productData: UpdateProductRequest): Promise<Product> {
    const response = await api.put(`/product/update/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/product/delete/${id}`);
  },

  async getProductHistory(id: number): Promise<PriceHistory[]> {
    const response = await api.get(`/product/${id}/history`);
    return response.data;
  },
};
