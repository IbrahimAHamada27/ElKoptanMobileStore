import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { Title, Meta } from '@angular/platform-browser';
import { ToastService } from '../../core/services/toast.service';
import { computed, signal, effect } from '@angular/core';

@Component({
  selector: 'app-dashboard-products',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class DashboardProducts implements OnInit {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  title = inject(Title);
  meta = inject(Meta);
  toastService = inject(ToastService);

  category = signal<string>('phone');

  // Local list of products to allow in-memory reordering before saving
  localProducts = signal<Product[]>([]);
  originalProductsString = '';
  hasUnsavedChanges = false;

  // Computed signal that automatically updates when category or productsSignal changes (as base data source)
  productsSource = computed(() => {
    const allProducts = this.productService.getAllProducts()();
    const cat = this.category();
    if (cat === 'offer') {
      return allProducts.filter(p => p.discountPrice && p.discountPrice < p.price);
    }
    return allProducts.filter(p => p.category === cat);
  });

  pageTitle = computed(() => {
    switch(this.category()) {
      case 'phone': return 'إدارة الهواتف';
      case 'accessory': return 'إدارة الإكسسوارات';
      case 'offer': return 'إدارة العروض';
      default: return 'إدارة المنتجات';
    }
  });

  constructor() {
    effect(() => {
      const source = this.productsSource();
      if (source && source.length > 0) {
        // Only load if we don't have active unsaved changes to prevent overwriting user's local order during typing/moving
        if (!this.hasUnsavedChanges) {
          this.localProducts.set(JSON.parse(JSON.stringify(source)));
          this.originalProductsString = JSON.stringify(this.localProducts());
          this.checkForChanges();
        }
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const cat = params.get('category');
      if (cat) {
        this.category.set(cat);
        this.title.setTitle(`${this.pageTitle()} | لوحة تحكم القبطان`);
        
        // Reset change tracking on category navigation
        const source = this.getProductsForCategory(cat);
        this.localProducts.set(JSON.parse(JSON.stringify(source)));
        this.originalProductsString = JSON.stringify(this.localProducts());
        this.hasUnsavedChanges = false;
      }
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  getProductsForCategory(cat: string): Product[] {
    const allProducts = this.productService.getAllProducts()();
    if (cat === 'offer') {
      return allProducts.filter(p => p.discountPrice && p.discountPrice < p.price);
    }
    return allProducts.filter(p => p.category === cat);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  checkForChanges() {
    this.hasUnsavedChanges = JSON.stringify(this.localProducts()) !== this.originalProductsString;
  }

  deleteProduct(id: string) {
    if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      this.productService.deleteProduct(id);
      // Also update local list
      this.localProducts.update(list => list.filter(p => p.id !== id));
      this.checkForChanges();
    }
  }

  moveUp(index: number) {
    if (index > 0) {
      const currentProducts = [...this.localProducts()];
      const temp = currentProducts[index];
      currentProducts[index] = currentProducts[index - 1];
      currentProducts[index - 1] = temp;
      this.localProducts.set(currentProducts);
      this.checkForChanges();
    }
  }

  moveDown(index: number) {
    const currentProducts = [...this.localProducts()];
    if (index < currentProducts.length - 1) {
      const temp = currentProducts[index];
      currentProducts[index] = currentProducts[index + 1];
      currentProducts[index + 1] = temp;
      this.localProducts.set(currentProducts);
      this.checkForChanges();
    }
  }

  async saveOrder() {
    if (!this.hasUnsavedChanges) return;
    try {
      await this.productService.reorderProducts(this.localProducts());
      this.originalProductsString = JSON.stringify(this.localProducts());
      this.checkForChanges();
      this.toastService.show('تم حفظ ترتيب المنتجات بنجاح!', 'success');
    } catch (error) {
      this.toastService.show('حدث خطأ أثناء حفظ الترتيب الجديد.', 'error');
    }
  }
}
