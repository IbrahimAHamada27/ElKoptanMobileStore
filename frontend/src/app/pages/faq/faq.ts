import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../../core/services/setting.service';

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
export class Faq {
  settingService = inject(SettingService);

  faqs = this.settingService.faqSignal;

  toggleFaq(index: number) {
    this.faqs.update(items => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], isOpen: !newItems[index].isOpen };
      return newItems;
    });
  }
}
