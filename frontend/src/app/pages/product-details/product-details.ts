import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);
  titleService = inject(Title);
  metaService = inject(Meta);
  
  product = signal<Product | undefined>(undefined);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.updateProductData(id);
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.updateProductData(id);
      }
    });
  }

  updateProductData(id: string) {
    const prod = this.productService.getProductById(id);
    this.product.set(prod);
    if (prod) {
      this.titleService.setTitle(`${prod.name} | القبطان موبايل ستور`);
      
      const cleanDesc = prod.desc ? prod.desc.replace(/<[^>]*>/g, '') : '';
      const metaDesc = cleanDesc ? (cleanDesc.length > 150 ? cleanDesc.slice(0, 150) + '...' : cleanDesc) : `اشترِ ${prod.name} الأصلي بأفضل الأسعار والضمان من القبطان موبايل ستور.`;
      
      this.metaService.updateTag({ name: 'description', content: metaDesc });
      this.metaService.updateTag({ property: 'og:title', content: `${prod.name} | القبطان موبايل ستور` });
      this.metaService.updateTag({ property: 'og:description', content: metaDesc });
      if (prod.image) {
        this.metaService.updateTag({ property: 'og:image', content: prod.image });
      }
    }
  }
}
