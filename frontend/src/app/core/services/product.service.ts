import { Injectable, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  _id?: string;
  id?: string; // For backward compatibility with old frontend models
  name: string;
  price: number;
  discountPrice?: number;
  image?: string;
  imagURL?: string; // Backend uses this
  category?: string;
  isNewProduct?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  orderIndex?: number;
  desc?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/product`;

  private productsSignal = signal<Product[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const response: any = await firstValueFrom(this.http.get(this.apiUrl));
      if (response && response.data) {
        // Map backend fields to frontend fields
        const mappedProducts = response.data.map((p: any) => ({
          ...p,
          id: p._id,
          image: p.imagURL ? (p.imagURL.startsWith('http') ? p.imagURL : `${environment.baseUrl}/${p.imagURL.replace(/\\/g, '/')}`) : 'assets/images/logo.png',
          isNew: p.isNewProduct
        }));
        this.productsSignal.set(mappedProducts);
      }
    } catch (error) {
      console.error('Failed to load products', error);
    }
  }

  products = this.productsSignal;

  getAllProducts() {
    return this.productsSignal;
  }

  getProductsByCategory(category: string) {
    return computed(() => this.productsSignal().filter(p => p.category === category));
  }

  getOffers() {
    return computed(() => this.productsSignal().filter(p => p.discountPrice && p.discountPrice < p.price));
  }

  getProductById(id: string) {
    return this.productsSignal().find(p => p.id === id);
  }

  getProductsByIds(ids: string[]) {
    return computed(() => {
      if (!ids || !ids.length) return [];
      return ids.map(id => this.getProductById(id)).filter(p => !!p) as Product[];
    });
  }

  async reorderProducts(reorderedProducts: Product[]) {
    // Optimistic UI update
    this.productsSignal.set([...reorderedProducts]);
    
    // Prepare payload
    const orders = reorderedProducts.map((p, index) => ({ id: p.id, orderIndex: index }));
    
    try {
      await firstValueFrom(this.http.patch(`${this.apiUrl}/reorder`, { orders }));
    } catch (error) {
      console.error('Failed to reorder products', error);
      // Revert if needed (or reload)
      this.loadProducts();
    }
  }

  async deleteProduct(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.productsSignal.update(products => products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  }
}
