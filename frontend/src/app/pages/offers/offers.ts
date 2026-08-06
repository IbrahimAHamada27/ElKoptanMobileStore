import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';
import { PaginationComponent } from '../../shared/pagination/pagination';
import { SearchBarComponent } from '../../shared/search-bar/search-bar';

@Component({
  selector: 'app-offers',
  imports: [CommonModule, RouterLink, PaginationComponent, SearchBarComponent],
  templateUrl: './offers.html',
  styleUrl: './offers.css'
})
export class Offers implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  settingService = inject(SettingService);
  seoService = inject(SeoService);

  currentPage = signal<number>(1);
  pageSize = 30;
  searchQuery = signal<string>('');

  allOffers = computed(() => {
    const data = this.settingService.featuredProductsSignal();
    const ids = data?.offers || [];
    let list: Product[] = [];
    if (ids && ids.length) {
      list = ids.map(id => this.productService.getProductById(id)).filter(p => !!p) as Product[];
    } else {
      list = this.productService.getOffers()();
    }

    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return list;

    return list.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.desc?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q)
    );
  });

  paginatedOffers = computed(() => {
    const list = this.allOffers();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
