import { Component, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-maintenance',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-header">
      <h2>إدارة بيانات الصيانة</h2>
    </div>

    <div class="form-container">
      <h3>الخدمات المقدمة</h3>
      <button class="btn-secondary" (click)="addService()" style="margin-bottom:15px; font-size:0.9rem;">إضافة خدمة جديدة +</button>
      
      <div class="list-container">
        <div class="list-item" *ngFor="let s of maintenanceData.services; let i = index">
          <div class="form-row">
            <input type="text" [(ngModel)]="s.icon" (ngModelChange)="checkForChanges()" class="form-control" placeholder="أيقونة (مثل 📱)" style="flex:0.5;">
            <input type="text" [(ngModel)]="s.title" (ngModelChange)="checkForChanges()" class="form-control" placeholder="عنوان الخدمة" style="flex:2;">
            <input type="text" [(ngModel)]="s.desc" (ngModelChange)="checkForChanges()" class="form-control" placeholder="وصف الخدمة" style="flex:4;">
            <button class="delete-btn" (click)="removeService(i)">حذف</button>
          </div>
        </div>
        <div *ngIf="maintenanceData.services?.length === 0" class="empty-state">لا توجد خدمات.</div>
      </div>

      <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">

      <h3>أرقام هواتف الصيانة</h3>
      <button class="btn-secondary" (click)="addNumber()" style="margin-bottom:15px; font-size:0.9rem;">إضافة رقم جديد +</button>

      <div class="list-container">
        <div class="list-item" *ngFor="let num of maintenanceData.numbers; let i = index">
          <div class="form-row">
            <input type="text" [(ngModel)]="num.title" (ngModelChange)="checkForChanges()" class="form-control" placeholder="الاسم (مثل: واتساب الصيانة)" style="flex:1;">
            <input type="text" [(ngModel)]="num.phone" (ngModelChange)="checkForChanges()" class="form-control" placeholder="الرقم" style="flex:1;">
            <button class="delete-btn" (click)="removeNumber(i)">حذف</button>
          </div>
        </div>
        <div *ngIf="maintenanceData.numbers?.length === 0" class="empty-state">لا توجد أرقام.</div>
      </div>

      <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">

      <h3>الفروع</h3>
      <button class="btn-secondary" (click)="addLocation()" style="margin-bottom:15px; font-size:0.9rem;">إضافة فرع جديد +</button>

      <div class="list-container">
        <div class="list-item" *ngFor="let loc of maintenanceData.locations; let i = index; trackBy: trackByIndex">
          <div class="form-row">
            <input type="text" [(ngModel)]="maintenanceData.locations[i]" (ngModelChange)="checkForChanges()" class="form-control" placeholder="اسم وعنوان الفرع">
            <button class="delete-btn" (click)="removeLocation(i)">حذف</button>
          </div>
        </div>
        <div *ngIf="maintenanceData.locations?.length === 0" class="empty-state">لا توجد فروع.</div>
      </div>
    </div>

    <div class="save-bar">
      <button class="btn-primary save-btn" [class.disabled-btn]="!hasUnsavedChanges" [disabled]="!hasUnsavedChanges" (click)="saveMaintenance()">حفظ التعديلات</button>
    </div>
  `,
  styles: [`
    .form-container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: var(--shadow); max-width: 800px; margin-bottom: 80px; }
    .list-container { display: flex; flex-direction: column; gap: 10px; }
    .list-item { background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #eee; }
    .form-row { display: flex; gap: 10px; align-items: center; }
    .form-control { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }
    .delete-btn { background: #fee2e2; color: #dc2626; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
    .empty-state { text-align: center; color: #666; padding: 20px; }
    .save-bar { position: fixed; bottom: 0; left: 0; right: 250px; background: #fff; padding: 15px 30px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); display: flex; justify-content: flex-end; z-index: 100; }
    .save-btn { font-size: 1.1rem; padding: 12px 30px; transition: all 0.3s; }
    .disabled-btn { background-color: #ccc !important; cursor: not-allowed; border-color: #ccc !important; color: #666 !important; }
    @media (max-width: 768px) { .save-bar { right: 0; } }
  `]
})
export class DashboardMaintenance {
  settingService = inject(SettingService);
  toastService = inject(ToastService);

  maintenanceData: any = { services: [], numbers: [], locations: [] };

  originalDataString: string = '';
  hasUnsavedChanges = false;

  constructor() {
    effect(() => {
      const data = this.settingService.maintenanceSignal();
      if (data && Object.keys(data).length > 0) {
        this.maintenanceData = JSON.parse(JSON.stringify(data));
        if (!this.originalDataString) {
          this.originalDataString = JSON.stringify(this.maintenanceData);
          this.checkForChanges();
        }
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  checkForChanges() {
    this.hasUnsavedChanges = JSON.stringify(this.maintenanceData) !== this.originalDataString;
  }

  trackByIndex(index: number, item: any): number { return index; }

  addService() { 
    this.maintenanceData.services.push({ icon: '', title: '', desc: '' }); 
    this.checkForChanges();
  }
  removeService(i: number) { 
    this.maintenanceData.services.splice(i, 1); 
    this.checkForChanges();
  }

  addNumber() { 
    this.maintenanceData.numbers.push({ title: '', phone: '' }); 
    this.checkForChanges();
  }
  removeNumber(i: number) { 
    this.maintenanceData.numbers.splice(i, 1); 
    this.checkForChanges();
  }

  addLocation() { 
    this.maintenanceData.locations.push(''); 
    this.checkForChanges();
  }
  removeLocation(i: number) { 
    this.maintenanceData.locations.splice(i, 1); 
    this.checkForChanges();
  }

  async saveMaintenance() {
    try {
      await this.settingService.updateSetting('maintenance', this.maintenanceData);
      this.originalDataString = JSON.stringify(this.maintenanceData);
      this.checkForChanges();
      this.toastService.show('تم حفظ بيانات الصيانة بنجاح!', 'success');
    } catch (error) {
      this.toastService.show('حدث خطأ أثناء الحفظ.', 'error');
    }
  }
}
