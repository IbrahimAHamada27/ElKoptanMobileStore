import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-cash',
  imports: [CommonModule, FormsModule],
  templateUrl: './cash.html',
  styleUrl: './cash.css',
})
export class Cash implements OnInit {
  settingService = inject(SettingService);
  seoService = inject(SeoService);
  payment = this.settingService.paymentSignal;

  // Amounts entered by users for each network
  vodafoneAmount: number | null = null;
  etisalatAmount: number | null = null;
  orangeAmount: number | null = null;
  weAmount: number | null = null;

  // Track copied state for visual feedback
  copiedId: string | null = null;

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'الدفع الإلكتروني والكاش (إنستا باي وفودافون كاش) | القبطان ستور',
      description: 'طرق الدفع الإلكتروني وتحويل الأموال الفورية عبر إنستا باي وفودافون كاش وأورنج وأوريدو ووي لدى القبطان موبايل ستور بمدينة العبور (01029729596).',
      keywords: 'دفع كاش القبطان, فودافون كاش القبطان, انستا باي القبطان, تحويل فلوس فودافون كاش العبور, رقم الكاش القبطان 01029729596',
      url: '/cash',
      jsonLd: this.seoService.getBreadcrumbSchema([
        { name: 'الرئيسية', url: '/' },
        { name: 'خدمات الكاش والدفع الإلكتروني', url: '/cash' }
      ])
    });
  }

  getVodafoneCode(phone: string): string {
    const amt = this.vodafoneAmount || 0;
    return `*9*7*${phone}*${amt}#`;
  }

  getEtisalatCode(phone: string): string {
    const amt = this.etisalatAmount || 0;
    return `*777*1*${phone}*${amt}#`;
  }

  getOrangeCode(phone: string): string {
    const amt = this.orangeAmount || 0;
    return `*115*1*${phone}*${amt}#`;
  }

  getWeCode(phone: string): string {
    const amt = this.weAmount || 0;
    return `*976*1*${phone}*${amt}#`;
  }

  copyText(text: string, id: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId = id;
      setTimeout(() => {
        if (this.copiedId === id) {
          this.copiedId = null;
        }
      }, 2000);
    });
  }

  // Helper to safely URL encode USSD code for phone dialing
  dialCode(code: string): string {
    return 'tel:' + encodeURIComponent(code);
  }
}
