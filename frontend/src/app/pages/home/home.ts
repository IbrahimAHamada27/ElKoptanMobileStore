import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  settingService = inject(SettingService);
  seoService = inject(SeoService);

  products = computed(() => {
    const data = this.settingService.featuredProductsSignal();
    const ids = data?.home || [];
    const allProducts = this.productService.products();
    if (!ids || !ids.length) {
      return allProducts;
    }
    const featured = ids.map(id => this.productService.getProductById(id)).filter(p => !!p);
    return featured.length > 0 ? featured : allProducts;
  });

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
