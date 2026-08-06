import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { PaginationComponent } from '../../shared/pagination/pagination';
import { SearchBarComponent } from '../../shared/search-bar/search-bar';

@Component({
  selector: 'app-accessories',
  imports: [CommonModule, RouterLink, PaginationComponent, SearchBarComponent],
  templateUrl: './accessories.html',
  styleUrl: './accessories.css'
})
export class Accessories implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  seoService = inject(SeoService);

  currentPage = signal<number>(1);
  pageSize = 30;
  searchQuery = signal<string>('');

  rawAccessories = this.productService.getProductsByCategory('accessory');

  allAccessories = computed(() => {
    const list = this.rawAccessories();
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

  paginatedAccessories = computed(() => {
    const list = this.allAccessories();
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
