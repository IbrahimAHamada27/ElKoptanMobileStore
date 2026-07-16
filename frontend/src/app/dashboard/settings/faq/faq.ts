import { Component, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-faq',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-header">
      <h2>إدارة الأسئلة الشائعة (FAQ)</h2>
      <button class="btn-primary" (click)="addQuestion()">إضافة سؤال جديد +</button>
    </div>

    <div class="faq-list">
      <div class="faq-card" *ngFor="let item of faqList; let i = index">
        <div class="form-group">
          <label>السؤال:</label>
          <input type="text" [(ngModel)]="item.question" (ngModelChange)="checkForChanges()" class="form-control" placeholder="أدخل السؤال...">
        </div>
        <div class="form-group">
          <label>الإجابة:</label>
          <textarea [(ngModel)]="item.answer" (ngModelChange)="checkForChanges()" class="form-control" rows="3" placeholder="أدخل الإجابة..."></textarea>
        </div>
        <button class="btn-action delete-btn" (click)="removeQuestion(i)">حذف هذا السؤال</button>
      </div>

      <div *ngIf="faqList.length === 0" class="empty-state">
        لا توجد أسئلة مضافة حالياً.
      </div>
    </div>

    <div class="save-bar">
      <button class="btn-primary save-btn" [class.disabled-btn]="!hasUnsavedChanges" [disabled]="!hasUnsavedChanges" (click)="saveFaqs()">حفظ التعديلات</button>
    </div>
  `,
  styles: [`
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 80px;
    }
    .faq-card {
      background: #fff;
      padding: 20px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      border-right: 4px solid var(--secondary-color);
    }
    .form-group { margin-bottom: 15px; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }
    .empty-state { text-align: center; padding: 40px; background: #fff; border-radius: 8px; }
    .save-bar { position: fixed; bottom: 0; left: 0; right: 250px; background: #fff; padding: 15px 30px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); display: flex; justify-content: flex-end; z-index: 100; }
    .save-btn { font-size: 1.1rem; padding: 12px 30px; transition: all 0.3s; }
    .disabled-btn { background-color: #ccc !important; cursor: not-allowed; border-color: #ccc !important; color: #666 !important; }
    .delete-btn { background: #fee2e2; color: #dc2626; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
    @media (max-width: 768px) { .save-bar { right: 0; } }
  `]
})
export class DashboardFaq {
  settingService = inject(SettingService);
  toastService = inject(ToastService);

  faqList: any[] = [];
  originalDataString: string = '';
  hasUnsavedChanges = false;

  constructor() {
    effect(() => {
      const data = this.settingService.faqSignal();
      if (data && Array.isArray(data)) {
        this.faqList = JSON.parse(JSON.stringify(data));
        if (!this.originalDataString) {
          this.originalDataString = JSON.stringify(this.faqList);
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
    this.hasUnsavedChanges = JSON.stringify(this.faqList) !== this.originalDataString;
  }

  addQuestion() {
    this.faqList.push({ question: '', answer: '', isOpen: false });
    this.checkForChanges();
  }

  removeQuestion(index: number) {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      this.faqList.splice(index, 1);
      this.checkForChanges();
    }
  }

  async saveFaqs() {
    try {
      await this.settingService.updateSetting('faq', this.faqList);
      this.originalDataString = JSON.stringify(this.faqList);
      this.checkForChanges();
      this.toastService.show('تم حفظ الأسئلة الشائعة بنجاح!', 'success');
    } catch (error) {
      this.toastService.show('حدث خطأ أثناء الحفظ.', 'error');
    }
  }
}
