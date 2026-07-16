import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-maintenance',
  imports: [CommonModule],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css',
})
export class Maintenance {
  settingService = inject(SettingService);
  maintenance = this.settingService.maintenanceSignal;
}
