import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';

export type PaymentMethodType = 'cod' | 'instapay' | 'vodafone' | 'orange' | 'etisalat';

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  altPhone: string;
  governorate: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
  notes: string;
  paymentMethod: PaymentMethodType;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  cartService = inject(CartService);
  settingService = inject(SettingService);
  seoService = inject(SeoService);
  toastService = inject(ToastService);
  router = inject(Router);

  isSubmitting = signal<boolean>(false);

  formData: CheckoutFormData = {
    fullName: '',
    phone: '',
    altPhone: '',
    governorate: 'القليوبية',
    city: 'مدينة العبور',
    area: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    landmark: '',
    notes: '',
    paymentMethod: 'cod'
  };

  governorates: string[] = [
    'القليوبية',
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'الشرقية',
    'المنوفية',
    'الدقهلية',
    'الغربية',
    'البحيرة',
    'دمياط',
    'السويس',
    'الإسماعيلية',
    'بورسعيد',
    'الفيوم',
    'بني سويف',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان'
  ];

  paymentMethods: { id: PaymentMethodType; label: string; icon: string; desc: string }[] = [
    { id: 'cod', label: 'الدفع عند الاستلام (كاش)', icon: '💵', desc: 'الدفع نقداً عند استلام طلبك من المندوب' },
    { id: 'instapay', label: 'إنستا باي InstaPay', icon: '⚡', desc: 'تحويل فوري عبر تطبيق إنستا باي' },
    { id: 'vodafone', label: 'فودافون كاش Vodafone Cash', icon: '🔴', desc: 'تحويل عبر محفظة فودافون كاش' },
    { id: 'orange', label: 'أورنج كاش Orange Cash', icon: '🟠', desc: 'تحويل عبر محفظة أورنج كاش' },
    { id: 'etisalat', label: 'إتصالات كاش Etisalat Cash', icon: '🟢', desc: 'تحويل عبر محفظة إتصالات كاش' }
  ];

  ngOnInit(): void {
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.seoService.setPageSeo({
      title: 'إتمام الطلب والدفع | القبطان موبايل ستور',
      description: 'أكمل بيانات التوصيل واختر طريقة الدفع المفضلة لتأكيد طلبك من القبطان ستور بسهولة عبر واتساب.',
      keywords: 'إتمام الطلب القبطان, شراء موبايل العبور, التوصيل العبور',
      url: '/checkout'
    });
  }

  selectPaymentMethod(method: PaymentMethodType): void {
    this.formData.paymentMethod = method;
  }

  getPaymentLabel(type: PaymentMethodType): string {
    const found = this.paymentMethods.find(m => m.id === type);
    return found ? found.label : 'الدفع عند الاستلام';
  }

  confirmOrder(): void {
    if (this.cartService.cartItems().length === 0) {
      this.toastService.show('سلة المشتريات فارغة!', 'error');
      return;
    }

    // Validation
    if (!this.formData.fullName.trim()) {
      this.toastService.show('يرجى كتابة الاسم بالكامل.', 'error');
      return;
    }
    if (!this.formData.phone.trim()) {
      this.toastService.show('يرجى كتابة رقم الهاتف.', 'error');
      return;
    }
    if (!this.formData.governorate.trim() || !this.formData.city.trim() || !this.formData.area.trim() || !this.formData.street.trim()) {
      this.toastService.show('يرجى إكمال بيانات العنوان الأساسية (المحافظة، المدينة، المنطقة، الشارع).', 'error');
      return;
    }

    this.isSubmitting.set(true);

    const contactData = this.settingService.contactSignal();
    const rawPhone = contactData?.whatsapp || contactData?.branches?.[0]?.salesPhone || '01034777762';
    
    let phoneNumber = rawPhone.replace(/\D/g, '');
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '2' + phoneNumber;
    }

    // Build structured WhatsApp message
    let message = `🛒 *طلب جديد من القبطان موبايل ستور*\n\n`;
    
    message += `👤 *بيانات العميل:*\n`;
    message += `• الاسم الكامل: ${this.formData.fullName.trim()}\n`;
    message += `• رقم الهاتف: ${this.formData.phone.trim()}\n`;
    if (this.formData.altPhone.trim()) {
      message += `• رقم هاتف بديل: ${this.formData.altPhone.trim()}\n`;
    }
    message += `\n`;

    message += `📍 *عنوان التوصيل:*\n`;
    message += `• المحافظة: ${this.formData.governorate.trim()}\n`;
    message += `• المدينة: ${this.formData.city.trim()}\n`;
    message += `• المنطقة: ${this.formData.area.trim()}\n`;
    message += `• الشارع: ${this.formData.street.trim()}\n`;
    if (this.formData.building.trim()) {
      message += `• المبنى / العمارة: ${this.formData.building.trim()}\n`;
    }
    if (this.formData.floor.trim() || this.formData.apartment.trim()) {
      message += `• الدور: ${this.formData.floor.trim() || '-'} | الشقة: ${this.formData.apartment.trim() || '-'}\n`;
    }
    if (this.formData.landmark.trim()) {
      message += `• أقرب علامة مميزة: ${this.formData.landmark.trim()}\n`;
    }
    if (this.formData.notes.trim()) {
      message += `• ملاحظات الطلب: ${this.formData.notes.trim()}\n`;
    }
    message += `\n`;

    message += `💳 *طريقة الدفع:* ${this.getPaymentLabel(this.formData.paymentMethod)}\n\n`;

    message += `🛍 *المنتجات المطلوبة:*\n`;
    this.cartService.cartItems().forEach((item, index) => {
      const price = item.product.discountPrice || item.product.price;
      const total = price * item.quantity;
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   - الكمية: ${item.quantity}\n`;
      message += `   - سعر الوحدة: ${price} جنيه\n`;
      message += `   - الإجمالي: ${total} جنيه\n`;
    });
    message += `\n`;

    message += `💰 *الإجمالي النهائي:* ${this.cartService.totalPrice()} جنيه\n\n`;
    message += `يرجى تأكيد الطلب والمتابعة لميعاد التسليم. شكراً لكم!`;

    // Open WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

    this.toastService.show('تم تحضير تفاصيل طلبك وفتح الواتساب بنجاح!', 'success');
    
    // Clear cart after sending
    this.cartService.cartItems.set([]);
    this.isSubmitting.set(false);
    this.router.navigate(['/']);
  }
}
