import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  settingService = inject(SettingService);
  seoService = inject(SeoService);

  currentPage = signal<number>(1);
  pageSize = 30;

  allProducts = computed(() => {
    const data = this.settingService.featuredProductsSignal();
    const ids = data?.home || [];
    const products = this.productService.products();
    if (!ids || !ids.length) {
      return products;
    }
    const featured = ids.map(id => this.productService.getProductById(id)).filter(p => !!p);
    return featured.length > 0 ? featured : products;
  });

  paginatedProducts = computed(() => {
    const list = this.allProducts();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'القبطان موبايل ستور | أفضل محل موبايلات واكسسوارات بمدينة العبور',
      description: 'أفضل محل موبايلات واكسسوارات وصيانة هواتف ذكية (آيفون، سامسونج، شاومي، ريلمي، أوبو) بمدينة العبور الحي الأول والقليوبية بأفضل الأسعار وأقوى العروض.',
      keywords: 'محل موبيلات في العبور, محل موبايلات في العبور, محل موبيلات العبور, أفضل محل موبايلات في العبور, أفضل محل موبيلات في الحي الأول العبور, شراء موبايل في العبور, صيانة موبايلات في العبور, اكسسوارات موبايلات في العبور, Elkoptan Mobile Store',
      url: '/',
      jsonLd: [
        this.seoService.getWebSiteSchema(),
        this.seoService.localBusinessData
      ]
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
