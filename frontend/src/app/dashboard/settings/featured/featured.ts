import { Component, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-featured',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-header">
      <h2>إدارة الرئيسية والعروض</h2>
      <p style="color: #666; margin-top: 5px;">اختر ورتب المنتجات التي ترغب بظهورها في الصفحة الرئيسية وصفحة العروض</p>
    </div>

    <div class="form-container">
      
      <!-- Home Page Products -->
      <div class="section">
        <h3 class="section-title">منتجات الصفحة الرئيسية</h3>
        
        <div class="add-product-row">
          <select [(ngModel)]="homeSelectedCategory" class="form-control" (change)="homeSelectedProduct = null">
            <option [ngValue]="null">-- اختر القسم --</option>
            <option value="phone">الهواتف</option>
            <option value="accessory">الإكسسوارات</option>
            <option value="offer">العروض</option>
          </select>

          <select [(ngModel)]="homeSelectedProduct" class="form-control" [disabled]="!homeSelectedCategory">
            <option [ngValue]="null">-- اختر منتج لإضافته للرئيسية --</option>
            <option *ngFor="let p of getProductsByCategory(homeSelectedCategory)" [ngValue]="p.id">{{ p.name }} - {{ p.price }} جنية</option>
          </select>

          <button class="btn-primary" [disabled]="!homeSelectedProduct" (click)="addHomeProduct()">إضافة</button>
        </div>

        <div class="selected-products-list">
          <div class="selected-product-item" *ngFor="let id of featuredData.home; let i = index">
            <span class="product-name-txt">{{ getProductName(id) }}</span>
            <div class="item-actions">
              <button class="btn-icon move-btn" [disabled]="i === 0" (click)="moveHome(i, -1)">⬆️</button>
              <button class="btn-icon move-btn" [disabled]="i === featuredData.home.length - 1" (click)="moveHome(i, 1)">⬇️</button>
              <button class="btn-icon delete-btn" (click)="removeHomeProduct(i)">🗑️ إزالة</button>
            </div>
          </div>
          <div *ngIf="featuredData.home.length === 0" class="empty-msg">لم يتم اختيار أي منتجات للرئيسية.</div>
        </div>
      </div>

      <hr style="margin: 40px 0; border: 0; border-top: 1px solid #eee;">

      <!-- Offers Page Products -->
      <div class="section">
        <h3 class="section-title">منتجات صفحة العروض</h3>
        
        <div class="add-product-row">
          <select [(ngModel)]="offersSelectedCategory" class="form-control" (change)="offersSelectedProduct = null">
            <option [ngValue]="null">-- اختر القسم --</option>
            <option value="phone">الهواتف</option>
            <option value="accessory">الإكسسوارات</option>
            <option value="offer">العروض</option>
          </select>

          <select [(ngModel)]="offersSelectedProduct" class="form-control" [disabled]="!offersSelectedCategory">
            <option [ngValue]="null">-- اختر منتج لإضافته للعروض --</option>
            <option *ngFor="let p of getProductsByCategory(offersSelectedCategory)" [ngValue]="p.id">{{ p.name }} - {{ p.price }} جنية</option>
          </select>

          <button class="btn-primary" [disabled]="!offersSelectedProduct" (click)="addOfferProduct()">إضافة</button>
        </div>

        <div class="selected-products-list">
          <div class="selected-product-item" *ngFor="let id of featuredData.offers; let i = index">
            <span class="product-name-txt">{{ getProductName(id) }}</span>
            <div class="item-actions">
              <button class="btn-icon move-btn" [disabled]="i === 0" (click)="moveOffer(i, -1)">⬆️</button>
              <button class="btn-icon move-btn" [disabled]="i === featuredData.offers.length - 1" (click)="moveOffer(i, 1)">⬇️</button>
              <button class="btn-icon delete-btn" (click)="removeOfferProduct(i)">🗑️ إزالة</button>
            </div>
          </div>
          <div *ngIf="featuredData.offers.length === 0" class="empty-msg">لم يتم اختيار أي منتجات للعروض.</div>
        </div>
      </div>

    </div>

    <div class="save-bar">
      <button class="btn-primary save-btn" [class.disabled-btn]="!hasUnsavedChanges" [disabled]="!hasUnsavedChanges" (click)="saveFeatured()">حفظ التعديلات</button>
    </div>
  `,
  styles: [`
    .form-container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: var(--shadow); max-width: 800px; margin-bottom: 80px; }
    .section-title { color: var(--primary-color); border-bottom: 2px solid var(--secondary-color); padding-bottom: 10px; margin-bottom: 20px; display: inline-block; }
    .add-product-row { display: flex; gap: 10px; margin-bottom: 20px; }
    .add-product-row select { flex: 1; }
    .form-control { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }
    .selected-products-list { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
    .selected-product-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-bottom: 1px solid #eee; background: #fafafa; }
    .selected-product-item:last-child { border-bottom: none; }
    .product-name-txt { flex: 1; font-weight: 600; }
    .item-actions { display: flex; gap: 10px; align-items: center; }
    .empty-msg { padding: 20px; text-align: center; color: #888; background: #fafafa; }
    .btn-icon { background: none; border: none; cursor: pointer; }
    .move-btn { font-size: 1.1rem; filter: grayscale(1); opacity: 0.6; transition: 0.2s; }
    .move-btn:hover:not([disabled]) { filter: grayscale(0); opacity: 1; }
    .move-btn[disabled] { opacity: 0.2; cursor: not-allowed; }
    .delete-btn { color: #dc3545; font-size: 0.9rem; }
    .delete-btn:hover { text-decoration: underline; }
    .save-bar { position: fixed; bottom: 0; left: 0; right: 250px; background: #fff; padding: 15px 30px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); display: flex; justify-content: flex-end; z-index: 100; }
    .save-btn { font-size: 1.1rem; padding: 12px 30px; transition: all 0.3s; }
    .disabled-btn { background-color: #ccc; cursor: not-allowed; border-color: #ccc; color: #666; }
    @media (max-width: 768px) { .save-bar { right: 0; } }
  `]
})
export class DashboardFeatured {
  settingService = inject(SettingService);
  productService = inject(ProductService);
  toastService = inject(ToastService);

  allProducts = this.productService.getAllProducts();

  featuredData: { home: string[], offers: string[] } = {
    home: [],
    offers: []
  };

  originalDataString: string = '';
  hasUnsavedChanges = false;

  homeSelectedCategory: string | null = null;
  homeSelectedProduct: string | null = null;

  offersSelectedCategory: string | null = null;
  offersSelectedProduct: string | null = null;

  constructor() {
    effect(() => {
      const data = this.settingService.featuredProductsSignal();
      if (data && (data.home || data.offers)) {
        this.featuredData = { 
          home: [...(data.home || [])], 
          offers: [...(data.offers || [])] 
        };
        // Set original data string on initial load
        if (!this.originalDataString) {
          this.originalDataString = JSON.stringify(this.featuredData);
          this.checkForChanges();
        }
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  getProductsByCategory(category: string | null): Product[] {
    if (!category) return [];
    return this.allProducts().filter(p => p.category === category);
  }

  getProductName(id: string): string {
    const p = this.productService.getProductById(id);
    return p ? p.name : 'منتج غير معروف';
  }

  checkForChanges() {
    this.hasUnsavedChanges = JSON.stringify(this.featuredData) !== this.originalDataString;
  }

  addHomeProduct() {
    if (this.homeSelectedProduct && !this.featuredData.home.includes(this.homeSelectedProduct)) {
      this.featuredData.home.push(this.homeSelectedProduct);
      this.homeSelectedProduct = null;
      this.checkForChanges();
    }
  }

  removeHomeProduct(index: number) {
    this.featuredData.home.splice(index, 1);
    this.checkForChanges();
  }

  moveHome(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.featuredData.home.length) {
      const item = this.featuredData.home.splice(index, 1)[0];
      this.featuredData.home.splice(newIndex, 0, item);
      this.checkForChanges();
    }
  }

  addOfferProduct() {
    if (this.offersSelectedProduct && !this.featuredData.offers.includes(this.offersSelectedProduct)) {
      this.featuredData.offers.push(this.offersSelectedProduct);
      this.offersSelectedProduct = null;
      this.checkForChanges();
    }
  }

  removeOfferProduct(index: number) {
    this.featuredData.offers.splice(index, 1);
    this.checkForChanges();
  }

  moveOffer(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.featuredData.offers.length) {
      const item = this.featuredData.offers.splice(index, 1)[0];
      this.featuredData.offers.splice(newIndex, 0, item);
      this.checkForChanges();
    }
  }

  async saveFeatured() {
    if (!this.hasUnsavedChanges) return;
    try {
      await this.settingService.updateSetting('featured_products', this.featuredData);
      this.originalDataString = JSON.stringify(this.featuredData);
      this.checkForChanges();
      this.toastService.show('تم حفظ الإعدادات بنجاح!', 'success');
    } catch (error) {
      this.toastService.show('حدث خطأ أثناء الحفظ.', 'error');
    }
  }
}
