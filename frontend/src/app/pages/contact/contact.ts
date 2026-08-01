import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  settingService = inject(SettingService);
  seoService = inject(SeoService);
  contact = this.settingService.contactSignal;

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'تواصل معنا | فروع وأرقام القبطان موبايل ستور بمدينة العبور',
      description: 'عناوين وأرقام تواصل فروع القبطان موبايل ستور في مدينة العبور الحي الأول والقليوبية. اتصل بنا للمبيعات والصيانة عبر الهاتف أو واتساب أو فيسبوك.',
      keywords: 'تواصل القبطان, فروع القبطان موبايل ستور, محل موبايل في العبور الحي الأول, رقم صيانة القبطان, عنوان القبطان موبايل ستور',
      url: '/contact',
      jsonLd: [
        this.seoService.getBreadcrumbSchema([
          { name: 'الرئيسية', url: '/' },
          { name: 'تواصل معنا', url: '/contact' }
        ]),
        this.seoService.localBusinessData
      ]
    });
  }
}
