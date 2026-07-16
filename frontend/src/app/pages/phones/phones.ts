import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-phones',
  imports: [CommonModule, RouterLink],
  templateUrl: './phones.html',
  styleUrl: './phones.css'
})
export class Phones implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  titleService = inject(Title);
  metaService = inject(Meta);

  phones = this.productService.getProductsByCategory('phone');

  ngOnInit() {
    this.titleService.setTitle('أحدث الهواتف الذكية | القبطان موبايل ستور');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'تصفح تشكيلة واسعة من أحدث الهواتف الذكية الأصلية من كبرى الشركات العالمية بأسعار مميزة في القبطان موبايل ستور.' 
    });
    this.metaService.updateTag({ property: 'og:title', content: 'أحدث الهواتف الذكية | القبطان موبايل ستور' });
    this.metaService.updateTag({ 
      property: 'og:description', 
      content: 'تصفح تشكيلة واسعة من أحدث الهواتف الذكية الأصلية من كبرى الشركات العالمية بأسعار مميزة في القبطان موبايل ستور.' 
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
