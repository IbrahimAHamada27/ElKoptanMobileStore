import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';

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
  seoService = inject(SeoService);
  
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
      const cleanDesc = prod.desc ? prod.desc.replace(/<[^>]*>/g, '') : '';
      const metaDesc = cleanDesc 
        ? (cleanDesc.length > 150 ? cleanDesc.slice(0, 150) + '...' : cleanDesc) 
        : `اشترِ ${prod.name} بأفضل سعر من القبطان موبايل ستور بمدينة العبور الحي الأول. أسعار ممتازة وضمان معتمد.`;

      const categoryName = prod.category === 'accessory' ? 'الإكسسوارات' : 'الهواتف الذكية';
      const categoryUrl = prod.category === 'accessory' ? '/accessories' : '/phones';

      const productSchema = this.seoService.getProductSchema({
        name: prod.name,
        description: metaDesc,
        image: prod.image,
        price: prod.price,
        discountPrice: prod.discountPrice,
        url: `/product/${id}`,
        category: categoryName
      });

      const breadcrumbSchema = this.seoService.getBreadcrumbSchema([
        { name: 'الرئيسية', url: '/' },
        { name: categoryName, url: categoryUrl },
        { name: prod.name, url: `/product/${id}` }
      ]);

      this.seoService.setPageSeo({
        title: `${prod.name} | أسعار الموبايلات والاكسسوارات في العبور | القبطان ستور`,
        description: metaDesc,
        keywords: `${prod.name}, أسعار الموبايلات في العبور, شراء ${prod.name} في العبور, محل موبيلات في العبور, القبطان موبايل ستور`,
        image: prod.image,
        url: `/product/${id}`,
        jsonLd: [breadcrumbSchema, productSchema]
      });
    }
  }
}
