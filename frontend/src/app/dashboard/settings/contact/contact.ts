import { Component, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-contact',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-header">
      <h2>إدارة بيانات التواصل</h2>
    </div>

    <div class="form-container">
      <div class="header-with-action">
        <h3>الفروع والأرقام</h3>
        <button class="btn-secondary add-branch-btn" (click)="addBranch()">+ إضافة فرع جديد</button>
      </div>
      
      <div class="branch-card" *ngFor="let branch of contactData.branches; let i = index">
        <div class="branch-header">
          <h4>الفرع {{ i + 1 }}</h4>
          <button class="btn-icon delete-btn" (click)="removeBranch(i)" *ngIf="contactData.branches.length > 1">🗑️ حذف الفرع</button>
        </div>
        
        <div class="form-group">
          <label>اسم الفرع (اختياري)</label>
          <input type="text" [(ngModel)]="branch.name" (ngModelChange)="checkForChanges()" placeholder="مثال: فرع الإسكندرية الرئيسي" class="form-control">
        </div>
        <div class="form-group">
          <label>العنوان</label>
          <input type="text" [(ngModel)]="branch.address" (ngModelChange)="checkForChanges()" class="form-control">
        </div>
        <div class="form-group">
          <label>رقم المبيعات</label>
          <input type="text" [(ngModel)]="branch.salesPhone" (ngModelChange)="checkForChanges()" class="form-control">
        </div>
        <div class="form-group">
          <label>رقم الصيانة</label>
          <input type="text" [(ngModel)]="branch.maintenancePhone" (ngModelChange)="checkForChanges()" class="form-control">
        </div>
      </div>

      <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
      
      <h3>معلومات عامة</h3>
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="email" [(ngModel)]="contactData.email" (ngModelChange)="checkForChanges()" class="form-control">
      </div>
      
      <h3>روابط السوشيال ميديا</h3>
      <br>
      <div class="form-group">
        <label>رابط فيسبوك</label>
        <input type="url" [(ngModel)]="contactData.facebook" (ngModelChange)="checkForChanges()" class="form-control">
      </div>
      <div class="form-group">
        <label>رابط إنستجرام</label>
        <input type="url" [(ngModel)]="contactData.instagram" (ngModelChange)="checkForChanges()" class="form-control">
      </div>
      <div class="form-group">
        <label>رابط واتساب (رقم الهاتف مع كود الدولة مثل: 201012345678)</label>
        <input type="text" [(ngModel)]="contactData.whatsapp" (ngModelChange)="checkForChanges()" class="form-control">
      </div>
      <div class="form-group">
        <label>رابط تيك توك</label>
        <input type="url" [(ngModel)]="contactData.tiktok" (ngModelChange)="checkForChanges()" class="form-control">
      </div>
      <div class="form-group">
        <label>رابط ماسنجر</label>
        <input type="url" [(ngModel)]="contactData.messenger" (ngModelChange)="checkForChanges()" class="form-control">
      </div>
    </div>

    <div class="save-bar">
      <button class="btn-primary save-btn" [class.disabled-btn]="!hasUnsavedChanges" [disabled]="!hasUnsavedChanges" (click)="saveContact()">حفظ التعديلات</button>
    </div>
  `,
  styles: [`
    .form-container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: var(--shadow); max-width: 800px; margin-bottom: 80px; }
    .header-with-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .branch-card { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .branch-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    .branch-header h4 { margin: 0; color: var(--primary-color); }
    .delete-btn { background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1rem; }
    .delete-btn:hover { text-decoration: underline; }
    .add-branch-btn { padding: 8px 15px; font-size: 0.9rem; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }
    .save-bar { position: fixed; bottom: 0; left: 0; right: 250px; background: #fff; padding: 15px 30px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); display: flex; justify-content: flex-end; z-index: 100; }
    .save-btn { font-size: 1.1rem; padding: 12px 30px; transition: all 0.3s; }
    .disabled-btn { background-color: #ccc !important; cursor: not-allowed; border-color: #ccc !important; color: #666 !important; }
    @media (max-width: 768px) { .save-bar { right: 0; } }
  `]
})
export class DashboardContact {
  settingService = inject(SettingService);
  toastService = inject(ToastService);

  contactData: any = {
    branches: [
      { name: 'الفرع الرئيسي', address: 'الإسكندرية، مصر', salesPhone: '01012345678', maintenancePhone: '01112345678' }
    ],
    email: 'info@alqubtan.com',
    facebook: '',
    instagram: '',
    whatsapp: '201012345678',
    tiktok: '',
    messenger: ''
  };

  originalDataString: string = '';
  hasUnsavedChanges = false;

  constructor() {
    effect(() => {
      const data = this.settingService.contactSignal();
      if (data && Object.keys(data).length > 0) {
        this.contactData = JSON.parse(JSON.stringify(data));
        // Migrate old data if branches array doesn't exist
        if (!this.contactData.branches) {
          this.contactData.branches = [
            { 
              name: 'الفرع الرئيسي', 
              address: data.address || '', 
              salesPhone: data.salesPhone || '', 
              maintenancePhone: data.maintenancePhone || '' 
            }
          ];
        }
        if (!this.originalDataString) {
          this.originalDataString = JSON.stringify(this.contactData);
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
    this.hasUnsavedChanges = JSON.stringify(this.contactData) !== this.originalDataString;
  }

  addBranch() {
    this.contactData.branches.push({ name: '', address: '', salesPhone: '', maintenancePhone: '' });
    this.checkForChanges();
  }

  removeBranch(index: number) {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      this.contactData.branches.splice(index, 1);
      this.checkForChanges();
    }
  }

  async saveContact() {
    try {
      await this.settingService.updateSetting('contact', this.contactData);
      this.originalDataString = JSON.stringify(this.contactData);
      this.checkForChanges();
      this.toastService.show('تم حفظ بيانات التواصل بنجاح!', 'success');
    } catch (error) {
      this.toastService.show('حدث خطأ أثناء الحفظ.', 'error');
    }
  }
}
