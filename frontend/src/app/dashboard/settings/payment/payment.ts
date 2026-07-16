import { Component, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-payment',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-header">
      <h2>إدارة طرق الدفع (كاش وإنستا باي)</h2>
    </div>

    <div class="form-container">
      <h3>بيانات حساب إنستا باي (InstaPay)</h3>
      <div class="payment-section-card">
        <div class="form-group">
          <label>الاسم الظاهر للعميل (الاسم الذي يظهر في إنستا باي)</label>
          <input type="text" [(ngModel)]="paymentData.instapayDisplayName" (ngModelChange)="checkForChanges()" placeholder="مثال: القبطان ستور" class="form-control">
        </div>
        <div class="form-group">
          <label>عنوان الدفع / اسم الحساب (InstaPay Address)</label>
          <input type="text" [(ngModel)]="paymentData.instapayAccountName" (ngModelChange)="checkForChanges()" placeholder="مثال: alqubtan@instapay" class="form-control">
        </div>
        <div class="form-group">
          <label>رقم الهاتف المرتبط بحساب إنستا باي</label>
          <input type="text" [(ngModel)]="paymentData.instapayPhone" (ngModelChange)="checkForChanges()" placeholder="مثال: 01012345678" class="form-control">
        </div>
        <div class="form-group">
          <label>رابط التحويل التلقائي (InstaPay Deep Link)</label>
          <input type="text" [(ngModel)]="paymentData.instapayLink" (ngModelChange)="checkForChanges()" placeholder="مثال: instapay://" class="form-control">
          <small class="help-text">رابط يفتح التطبيق مباشرة على الهواتف المحمولة (يمكن إبقاءه instapay://)</small>
        </div>
      </div>

      <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">

      <h3>أرقام محافظ الكاش (Cash Wallets)</h3>
      <div class="payment-section-card">
        <div class="form-group">
          <label>رقم فودافون كاش (Vodafone Cash)</label>
          <input type="text" [(ngModel)]="paymentData.vodafonePhone" (ngModelChange)="checkForChanges()" placeholder="مثال: 01012345678" class="form-control">
        </div>
        <div class="form-group">
          <label>رقم اتصالات كاش (Etisalat Cash)</label>
          <input type="text" [(ngModel)]="paymentData.etisalatPhone" (ngModelChange)="checkForChanges()" placeholder="مثال: 01112345678" class="form-control">
        </div>
        <div class="form-group">
          <label>رقم أورنج كاش (Orange Cash)</label>
          <input type="text" [(ngModel)]="paymentData.orangePhone" (ngModelChange)="checkForChanges()" placeholder="مثال: 01212345678" class="form-control">
        </div>
        <div class="form-group">
          <label>رقم وي باي (WE Pay)</label>
          <input type="text" [(ngModel)]="paymentData.wePhone" (ngModelChange)="checkForChanges()" placeholder="مثال: 01512345678" class="form-control">
        </div>
      </div>
    </div>

    <div class="save-bar">
      <button class="btn-primary save-btn" [class.disabled-btn]="!hasUnsavedChanges" [disabled]="!hasUnsavedChanges" (click)="savePaymentSettings()">حفظ التعديلات</button>
    </div>
  `,
  styles: [`
    .form-container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: var(--shadow); max-width: 800px; margin-bottom: 80px; }
    .payment-section-card { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-top: 10px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.95rem; color: #333; }
    .form-control { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; font-size: 0.95rem; }
    .form-control:focus { border-color: var(--primary-color); outline: none; }
    .help-text { color: #888; font-size: 0.8rem; margin-top: 5px; display: block; }
    .save-bar { position: fixed; bottom: 0; left: 0; right: 250px; background: #fff; padding: 15px 30px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); display: flex; justify-content: flex-end; z-index: 100; }
    .save-btn { font-size: 1.1rem; padding: 12px 30px; transition: all 0.3s; }
    .disabled-btn { background-color: #ccc !important; cursor: not-allowed; border-color: #ccc !important; color: #666 !important; }
    @media (max-width: 768px) { .save-bar { right: 0; } }
  `]
})
export class DashboardPayment {
  settingService = inject(SettingService);
  toastService = inject(ToastService);

  paymentData: any = {
    instapayPhone: '',
    instapayAccountName: '',
    instapayDisplayName: '',
    instapayLink: 'instapay://',
    vodafonePhone: '',
    orangePhone: '',
    etisalatPhone: '',
    wePhone: ''
  };

  originalDataString: string = '';
  hasUnsavedChanges = false;

  constructor() {
    effect(() => {
      const data = this.settingService.paymentSignal();
      if (data && Object.keys(data).length > 0) {
        this.paymentData = JSON.parse(JSON.stringify(data));
        if (!this.originalDataString) {
          this.originalDataString = JSON.stringify(this.paymentData);
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
    this.hasUnsavedChanges = JSON.stringify(this.paymentData) !== this.originalDataString;
  }

  async savePaymentSettings() {
    try {
      await this.settingService.updateSetting('payment', this.paymentData);
      this.originalDataString = JSON.stringify(this.paymentData);
      this.checkForChanges();
      this.toastService.show('تم حفظ إعدادات طرق الدفع بنجاح!', 'success');
    } catch (error) {
      this.toastService.show('حدث خطأ أثناء حفظ الإعدادات.', 'error');
    }
  }
}
