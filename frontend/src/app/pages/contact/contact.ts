import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  settingService = inject(SettingService);
  contact = this.settingService.contactSignal;
}
