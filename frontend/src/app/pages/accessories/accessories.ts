import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-accessories',
  imports: [CommonModule, RouterLink],
  templateUrl: './accessories.html',
  styleUrl: './accessories.css'
})
export class Accessories implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  titleService = inject(Title);
  metaService = inject(Meta);

  accessories = this.productService.getProductsByCategory('accessory');

  ngOnInit() {
    this.titleService.setTitle('إكسسوارات الهواتف الأصلية | القبطان موبايل ستور');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'اكتشف أفضل إكسسوارات الهواتف، السماعات، الشواحن، الكابلات، والجرابات الأصلية بأسعار رائعة في القبطان موبايل ستور.' 
    });
    this.metaService.updateTag({ property: 'og:title', content: 'إكسسوارات الهواتف الأصلية | القبطان موبايل ستور' });
    this.metaService.updateTag({ 
      property: 'og:description', 
      content: 'اكتشف أفضل إكسسوارات الهواتف، السماعات، الشواحن، الكابلات، والجرابات الأصلية بأسعار رائعة في القبطان موبايل ستور.' 
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
