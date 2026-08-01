import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../../core/services/setting.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-maintenance',
  imports: [CommonModule],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css',
})
export class Maintenance implements OnInit {
  settingService = inject(SettingService);
  seoService = inject(SeoService);
  maintenance = this.settingService.maintenanceSignal;

  ngOnInit() {
    this.seoService.setPageSeo({
      title: 'صيانة وتصليح موبايلات في العبور | تغيير شاشات وبطاريات | القبطان',
      description: 'أفضل مركز صيانة وتصليح موبايلات بمدينة العبور الحي الأول. تصليح ايفون، سامسونج، شاومي، ريلمي، وتغيير الشاشات والبطاريات بقطع غيار أصلية وضمان معتمد.',
      keywords: 'صيانة موبايلات في العبور, صيانة موبيلات في العبور, تصليح موبايلات العبور, تصليح موبيلات العبور, تغيير شاشة موبايل في العبور, تغيير بطارية موبايل في العبور, أفضل محل صيانة موبايلات في العبور, صيانة ايفون في العبور, صيانة سامسونج في العبور, صيانة شاومي في العبور, صيانة ريلمي في العبور',
      url: '/maintenance',
      jsonLd: [
        this.seoService.getBreadcrumbSchema([
          { name: 'الرئيسية', url: '/' },
          { name: 'مركز الصيانة', url: '/maintenance' }
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          'name': 'خدمات صيانة وتصليح الموبايلات بمدينة العبور',
          'provider': this.seoService.localBusinessData,
          'serviceType': 'Mobile Phone Repair Service',
          'areaServed': {
            '@type': 'AdministrativeArea',
            'name': 'مدينة العبور - القليوبية'
          },
          'description': 'خدمة صيانة فورية وشاملة وتغيير شاشات وبطاريات لجميع الهواتف الذكية بقطع غيار أصلية وضمان في مدينة العبور.'
        }
      ]
    });
  }
}
