import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-phones',
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './phones.html',
  styleUrl: './phones.css'
})
export class Phones implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  seoService = inject(SeoService);

  currentPage = signal<number>(1);
  pageSize = 30;

  allPhones = this.productService.getProductsByCategory('phone');

  paginatedPhones = computed(() => {
    const list = this.allPhones();
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
