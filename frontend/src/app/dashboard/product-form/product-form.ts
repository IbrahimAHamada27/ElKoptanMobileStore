import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  productService = inject(ProductService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  location = inject(Location);
  toastService = inject(ToastService);

  isEditMode = false;
  productId: string | null = null;
  selectedFile: File | null = null;

  productData = {
    name: '',
    desc: '',
    price: 0,
    discountPrice: 0,
    stock: 1,
    category: 'phone',
    isNewProduct: false,
    isBestSeller: false,
    slug: ''
  };

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      const existingProduct = this.productService.getProductById(this.productId);
      if (existingProduct) {
        this.productData = {
          name: existingProduct.name,
          desc: existingProduct.desc || '',
          price: existingProduct.price,
          discountPrice: existingProduct.discountPrice || 0,
          stock: (existingProduct as any).stock || 10,
          category: existingProduct.category || 'phone',
          isNewProduct: existingProduct.isNewProduct || false,
          isBestSeller: existingProduct.isBestSeller || false,
          slug: (existingProduct as any).slug || existingProduct.id
        };
      }
    } else {
      // Check query param for category
      const qCategory = this.route.snapshot.queryParamMap.get('category');
      if (qCategory) {
        this.productData.category = qCategory;
      }
    }
  }

  goBack() {
    this.location.back();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async onSubmit() {
    try {
      const formData = new FormData();
      formData.append('name', this.productData.name);
      formData.append('desc', this.productData.desc);
      formData.append('price', this.productData.price.toString());
      if (this.productData.discountPrice) {
        formData.append('discountPrice', this.productData.discountPrice.toString());
      }
      formData.append('stock', this.productData.stock.toString());
      formData.append('category', this.productData.category);
      formData.append('isNewProduct', this.productData.isNewProduct.toString());
      formData.append('isBestSeller', this.productData.isBestSeller.toString());
      
      // Auto-generate slug if adding
      if (!this.isEditMode) {
        this.productData.slug = this.productData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        formData.append('slug', this.productData.slug);
      }

      if (this.selectedFile) {
        formData.append('img', this.selectedFile);
      }

      const apiUrl = `${environment.apiUrl}/product`;

      if (this.isEditMode) {
        await firstValueFrom(this.http.put(`${apiUrl}/${this.productId}`, formData));
      } else {
        await firstValueFrom(this.http.post(apiUrl, formData));
      }

      // Reload products
      await this.productService.loadProducts();
      this.goBack();

    } catch (error) {
      console.error('Failed to save product', error);
      this.toastService.show('حدث خطأ أثناء حفظ المنتج. تأكد من إرفاق صورة عند الإضافة الجديدة.', 'error');
    }
  }
}
