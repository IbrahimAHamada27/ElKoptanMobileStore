import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { computed } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

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
  titleService = inject(Title);
  metaService = inject(Meta);

  offers = computed(() => {
    const data = this.settingService.featuredProductsSignal();
    const ids = data?.offers || [];
    if (!ids || !ids.length) return [];
    return ids.map(id => this.productService.getProductById(id)).filter(p => !!p);
  });

  ngOnInit() {
    this.titleService.setTitle('العروض المميزة والتخفيضات | القبطان موبايل ستور');
    this.metaService.updateTag({ 
      name: 'description', 
      content: 'استمتع بأقوى العروض والتخفيضات المميزة والحصرية على الهواتف والاكسسوارات من القبطان موبايل ستور. وفر أكثر مع عروض القبطان.' 
    });
    this.metaService.updateTag({ property: 'og:title', content: 'العروض المميزة والتخفيضات | القبطان موبايل ستور' });
    this.metaService.updateTag({ 
      property: 'og:description', 
      content: 'استمتع بأقوى العروض والتخفيضات المميزة والحصرية على الهواتف والاكسسوارات من القبطان موبايل ستور. وفر أكثر مع عروض القبطان.' 
    });
  }

  getDiscountPercentage(price: number, discountPrice: number): number {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
