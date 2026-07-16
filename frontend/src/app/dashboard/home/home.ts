import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule],
  template: `
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>إجمالي المنتجات</h3>
        <p class="stat-value">{{ productsCount() }}</p>
      </div>
      <div class="stat-card">
        <h3>المنتجات المعروضة للخصم</h3>
        <p class="stat-value">{{ offersCount() }}</p>
      </div>
      <div class="stat-card">
        <h3>الطلبات الجديدة</h3>
        <p class="stat-value">{{ ordersCount() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .stat-card {
      background: white;
      padding: 30px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      text-align: center;
      border-bottom: 4px solid var(--secondary-color);
    }
    .stat-card h3 {
      margin-bottom: 15px;
      color: var(--text-color);
    }
    .stat-value {
      font-size: 3rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }
  `]
})
export class DashboardHome implements OnInit {
  productService = inject(ProductService);
  orderService = inject(OrderService);
  title = inject(Title);
  meta = inject(Meta);

  productsCount = computed(() => this.productService.getAllProducts()().length);
  offersCount = computed(() => this.productService.getOffers()().length);
  ordersCount = computed(() => this.orderService.orders().length);

  ngOnInit() {
    this.title.setTitle('الإحصائيات | لوحة تحكم القبطان');
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }
}
