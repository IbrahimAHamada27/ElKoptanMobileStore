import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-offers',
  imports: [CommonModule, RouterLink],
  templateUrl: './offers.html',
  styleUrl: './offers.css'
})
export class Offers implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  settingService = inject(SettingService);
  seoService = inject(SeoService);

  offers = computed(() => {
    const data = this.settingService.featuredProductsSignal();
    const ids = data?.offers || [];
    if (!ids || !ids.length) return [];
    return ids.map(id => this.productService.getProductById(id)).filter(p => !!p);
  });

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'أفضل عروض الموبايلات والتخفيضات في العبور | القبطان ستور',
      description: 'أقوى عروض الموبايلات وتخفيضات الهواتف الذكية والإكسسوارات في مدينة العبور. أسعار تنافسية وخصومات حصرية من القبطان موبايل ستور.',
      keywords: 'أفضل عروض الموبايلات في العبور, عروض موبايلات العبور, تخفيضات موبايلات مدينة العبور, شراء موبايلات بالتقسيط في العبور, عروض القبطان موبايل ستور',
      url: '/offers',
      jsonLd: this.seoService.getBreadcrumbSchema([
        { name: 'الرئيسية', url: '/' },
        { name: 'العروض المميزة', url: '/offers' }
      ])
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
