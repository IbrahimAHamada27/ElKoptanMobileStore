import { Injectable, signal } from '@angular/core';
import { Product } from './product.service';

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  orders = signal<Order[]>([]);

  constructor() {}

  addOrder(order: Order) {
    this.orders.update(orders => [order, ...orders]);
  }

  updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled') {
    this.orders.update(orders => 
      orders.map(o => o.id === id ? { ...o, status } : o)
    );
  }

  deleteOrder(id: string) {
    this.orders.update(orders => orders.filter(o => o.id !== id));
  }
}
