import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartService = inject(CartService);
  settingService = inject(SettingService);
  seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'سلة المشتريات | القبطان موبايل ستور',
      description: 'سلة المشتريات الخاصة بك في متجر القبطان موبايل ستور. أكمل عملية الشراء بسهولة عبر واتساب.',
      keywords: 'سلة المشتريات القبطان, شراء موبايل في العبور, طلبية القبطان موبايل',
      url: '/cart'
    });
  }

  checkoutWhatsApp() {
    if (this.cartService.cartItems().length === 0) return;

    const contactData = this.settingService.contactSignal();
    let rawPhone = contactData?.whatsapp || contactData?.branches?.[0]?.salesPhone || '01034777762';
    
    // Sanitize phone number (keep digits only)
    let phoneNumber = rawPhone.replace(/\D/g, '');
    
    // Auto prefix Egypt country code if starting with 010, 011, 012, 015 or 0
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '2' + phoneNumber;
    }

    let message = `مرحباً القبطان موبايل ستور، أود طلب المشتريات التالية:\n\n`;
    this.cartService.cartItems().forEach((item, index) => {
      const price = item.product.discountPrice || item.product.price;
      message += `${index + 1}. ${item.product.name}\n   - الكمية: ${item.quantity}\n   - السعر: ${price * item.quantity} جنيه\n\n`;
    });
    message += `إجمالي المبلغ المطلـوب: ${this.cartService.totalPrice()} جنيه\n\nيرجى تأكيد الطلب وتحديد عنوان التوصيل.`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  }
}
