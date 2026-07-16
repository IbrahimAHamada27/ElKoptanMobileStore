import { Injectable, signal, computed, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  totalItems = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + (price * item.quantity);
  }, 0));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.cartItems.set(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from local storage', e);
        }
      }
    }

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('cart', JSON.stringify(this.cartItems()));
      }
    });
  }

  addToCart(product: Product) {
    this.cartItems.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  decreaseQuantity(productId: string | undefined) {
    if (!productId) return;
    this.cartItems.update(items => {
      const existing = items.find(i => i.product.id === productId);
      if (existing && existing.quantity > 1) {
        return items.map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
      } else if (existing && existing.quantity === 1) {
        return items.filter(i => i.product.id !== productId);
      }
      return items;
    });
  }

  getQuantity(productId: string | undefined): number {
    if (!productId) return 0;
    const item = this.cartItems().find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  removeFromCart(productId: string | undefined) {
    if (!productId) return;
    this.cartItems.update(items => items.filter(i => i.product.id !== productId));
  }
}
