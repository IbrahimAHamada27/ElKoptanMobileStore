import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-accessories',
  imports: [CommonModule, RouterLink],
  templateUrl: './accessories.html',
  styleUrl: './accessories.css'
})
export class Accessories implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  seoService = inject(SeoService);

  accessories = this.productService.getProductsByCategory('accessory');

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'إكسسوارات موبايلات وجرابات وشواحن في العبور | القبطان ستور',
      description: 'أفضل محل اكسسوارات موبايلات في العبور الحي الأول. جرابات ايفون وسامسونج وشاومي، اسكرينات حماية، شواحن سريعة، وسماعات أصلية من القبطان موبايل ستور.',
      keywords: 'اكسسوارات موبايلات في العبور, اكسسوارات موبيلات في العبور, جرابات موبايل في العبور, اسكرينة موبايل في العبور, شواحن موبايل في العبور, سماعات موبايل في العبور, أفضل محل اكسسوارات موبايلات في العبور',
      url: '/accessories',
      jsonLd: this.seoService.getBreadcrumbSchema([
        { name: 'الرئيسية', url: '/' },
        { name: 'الإكسسوارات الأصلية', url: '/accessories' }
      ])
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
