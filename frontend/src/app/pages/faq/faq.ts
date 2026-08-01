import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class Faq implements OnInit {
  settingService = inject(SettingService);
  seoService = inject(SeoService);

  faqs = this.settingService.faqSignal;

  constructor() {
    effect(() => {
      const faqItems = this.faqs();
      if (faqItems && faqItems.length > 0) {
        const faqPageSchema = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': faqItems.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.answer
            }
          }))
        };

        this.seoService.injectJsonLd([
          this.seoService.getBreadcrumbSchema([
            { name: 'الرئيسية', url: '/' },
            { name: 'الأسئلة الشائعة', url: '/faq' }
          ]),
          faqPageSchema
        ]);
      }
    });
  }

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'الأسئلة الشائعة | القبطان موبايل ستور مدينة العبور',
      description: 'إجابات شاملة لكافة الأسئلة الشائعة حول شراء الموبايلات والاكسسوارات وخدمات الصيانة والضمان وطرق الدفع لدى القبطان موبايل ستور في العبور.',
      keywords: 'الأسئلة الشائعة القبطان, أسئلة شراء موبايل في العبور, أسئلة صيانة موبايلات العبور, ضمان القبطان موبايل ستور',
      url: '/faq',
      jsonLd: this.seoService.getBreadcrumbSchema([
        { name: 'الرئيسية', url: '/' },
        { name: 'الأسئلة الشائعة', url: '/faq' }
      ])
    });
  }

  toggleFaq(index: number) {
    this.faqs.update(items => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], isOpen: !newItems[index].isOpen };
      return newItems;
    });
  }
}
