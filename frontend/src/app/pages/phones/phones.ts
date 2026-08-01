import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-phones',
  imports: [CommonModule, RouterLink],
  templateUrl: './phones.html',
  styleUrl: './phones.css'
})
export class Phones implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  seoService = inject(SeoService);

  phones = this.productService.getProductsByCategory('phone');

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'هواتف وموبايلات في مدينة العبور | أسعار الموبايلات | القبطان موبايل ستور',
      description: 'شراء أحدث الهواتف المحمولة والذكية في مدينة العبور لدى القبطان موبايل ستور. أيفون، سامسونج، شاومي، ريلمي، وأوبو بأسعار تنافسية وضمان أصلي.',
      keywords: 'موبايلات في العبور, هواتف في العبور, محل موبايلات في العبور, شراء موبايل في العبور, ايفون في العبور, سامسونج في العبور, ريدمي في العبور, شاومي في العبور, ريلمي في العبور, اوبو في العبور, أسعار الموبايلات في العبور, أفضل محل موبايلات في العبور',
      url: '/phones',
      jsonLd: this.seoService.getBreadcrumbSchema([
        { name: 'الرئيسية', url: '/' },
        { name: 'الهواتف الذكية', url: '/phones' }
      ])
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
