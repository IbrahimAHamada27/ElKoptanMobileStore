import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { computed } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

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
  titleService = inject(Title);
  metaService = inject(Meta);

  products = computed(() => {
    const data = this.settingService.featuredProductsSignal();
    const ids = data?.home || [];
    if (!ids || !ids.length) return [];
    return ids.map(id => this.productService.getProductById(id)).filter(p => !!p);
  });

  ngOnInit() {
    this.titleService.setTitle('الرئيسية | القبطان موبايل ستور');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'مرحبًا بك في القبطان موبايل ستور، متجرك الأول لأحدث الهواتف الذكية والإكسسوارات الأصلية في مصر بأفضل الأسعار وبأعلى جودة خدمة.' 
    });
    this.metaService.updateTag({ property: 'og:title', content: 'الرئيسية | القبطان موبايل ستور' });
    this.metaService.updateTag({ 
      property: 'og:description', 
      content: 'مرحبًا بك في القبطان موبايل ستور، متجرك الأول لأحدث الهواتف الذكية والإكسسوارات الأصلية في مصر بأفضل الأسعار وبأعلى جودة خدمة.' 
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
