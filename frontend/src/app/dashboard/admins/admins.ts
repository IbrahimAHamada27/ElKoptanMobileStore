import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard-admins',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-header">
      <h2>👥 إدارة حسابات المدراء</h2>
      <button class="btn-primary" (click)="openAddModal()">إضافة مدير جديد +</button>
    </div>

    <!-- Hashed admins notice -->
    <div class="notice-card">
      <span class="notice-icon">🔒</span>
      <div class="notice-content">
        <h4>تنبيه الأمان العالي</h4>
        <p>جميع بيانات المدراء (الاسم واسم المستخدم وكلمة المرور) يتم تشفيرها باستخدام خوارزميات الهاش أحادية الاتجاه (SHA-256 و Bcrypt) لحماية المتجر. لا يتم حفظ البيانات الحقيقية بأي شكل مقروء في قاعدة البيانات.</p>
      </div>
    </div>

    <div class="products-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>الاسم (مُهيش)</th>
            <th>اسم المستخدم (مُهيش)</th>
            <th>الصلاحيات</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let admin of admins(); let i = index">
            <td class="hash-text" [title]="admin.name">{{ admin.name.substring(0, 24) }}...</td>
            <td class="hash-text" [title]="admin.email">{{ admin.email.substring(0, 24) }}...</td>
            <td>
              <span class="badge bg-green">{{ admin.role === 'admin' ? 'مدير' : admin.role }}</span>
            </td>
            <td>
              <button class="btn-action edit-btn" (click)="openEditModal(admin)">تعديل</button>
              <button class="btn-action delete-btn" (click)="onDelete(admin._id)">حذف</button>
            </td>
          </tr>
          <tr *ngIf="admins().length === 0">
            <td colspan="4" class="text-center">لا توجد حسابات مدراء حالياً.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Admin Form Modal -->
    <div class="modal-overlay" *ngIf="isModalOpen()">
      <div class="modal-card">
        <h3>{{ isEditMode() ? 'تعديل بيانات المدير' : 'إضافة مدير جديد' }}</h3>
        
        <form (submit)="onSubmit($event)">
          <div class="form-group">
            <label>الاسم الحقيقي للمدير</label>
            <input type="text" [(ngModel)]="formData.name" name="name" required class="form-control" placeholder="مثال: أحمد محمد" />
          </div>
          
          <div class="form-group">
            <label>اسم المستخدم (البريد الإلكتروني)</label>
            <input type="text" [(ngModel)]="formData.email" name="email" required class="form-control" placeholder="مثال: ahmed@example.com" />
          </div>

          <div class="form-group">
            <label>كلمة المرور {{ isEditMode() ? '(اتركها فارغة إذا لم تكن تريد تغييرها)' : '' }}</label>
            <input type="password" [(ngModel)]="formData.password" name="password" [required]="!isEditMode()" class="form-control" placeholder="••••••••" />
          </div>

          <div class="form-group code-group">
            <label class="danger-label">كود التحقق الخاص بالسوبر أدمن (مطلوب)</label>
            <input type="password" [(ngModel)]="formData.code" name="code" required class="form-control code-input" placeholder="أدخل كود التحقق لإتمام العملية" />
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-primary modal-save-btn" [disabled]="isSaving()">
              {{ isSaving() ? 'جاري الحفظ...' : 'حفظ البيانات' }}
            </button>
            <button type="button" class="btn-secondary" (click)="closeModal()">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .notice-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-right: 5px solid #d97706;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      gap: 15px;
      align-items: flex-start;
      direction: rtl;
    }

    .notice-icon {
      font-size: 1.5rem;
    }

    .notice-content h4 {
      margin: 0 0 5px 0;
      color: #0f172a;
      font-weight: 700;
    }

    .notice-content p {
      margin: 0;
      color: #475569;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .hash-text {
      font-family: monospace;
      color: #64748b;
      font-size: 0.9rem;
    }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      direction: rtl;
      text-align: right;
    }

    .modal-card h3 {
      margin-top: 0;
      color: var(--primary-color);
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: inherit;
    }

    .form-control:focus {
      border-color: var(--primary-color);
      outline: none;
    }

    .code-group {
      background: #fef2f2;
      padding: 15px;
      border-radius: 8px;
      border: 1px dashed #fca5a5;
      margin-top: 20px;
    }

    .danger-label {
      color: #dc2626 !important;
    }

    .code-input {
      border-color: #fca5a5;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 25px;
    }

    .modal-save-btn {
      background-color: #d97706 !important;
      border-color: #d97706 !important;
    }

    .modal-save-btn:hover {
      background-color: #b45309 !important;
    }
  `]
})
export class DashboardAdmins implements OnInit {
  http = inject(HttpClient);
  toastService = inject(ToastService);

  admins = signal<AdminUser[]>([]);
  isModalOpen = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);
  
  editingAdminId: string | null = null;

  formData = {
    name: '',
    email: '',
    password: '',
    code: ''
  };

  apiUrl = `${environment.apiUrl}/user`;

  ngOnInit() {
    this.loadAdmins();
  }

  async loadAdmins() {
    try {
      const response: any = await firstValueFrom(this.http.get(this.apiUrl));
      if (response && response.data) {
        this.admins.set(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load admins', err);
      this.toastService.show('حدث خطأ أثناء تحميل الحسابات.', 'error');
    }
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.editingAdminId = null;
    this.formData = { name: '', email: '', password: '', code: '' };
    this.isModalOpen.set(true);
  }

  openEditModal(admin: AdminUser) {
    this.isEditMode.set(true);
    this.editingAdminId = admin._id;
    // Keep credentials placeholder since we can't reverse SHA-256 hashes
    this.formData = {
      name: '',
      email: '',
      password: '',
      code: ''
    };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (!this.formData.name || !this.formData.email || !this.formData.code) {
      this.toastService.show('يرجى ملء جميع الخانات الأساسية وكود التحقق.', 'error');
      return;
    }

    this.isSaving.set(true);
    try {
      const headers = new HttpHeaders().set('x-super-admin-code', this.formData.code);
      
      if (this.isEditMode()) {
        const payload: any = {
          name: this.formData.name,
          email: this.formData.email
        };
        if (this.formData.password) {
          payload.password = this.formData.password;
        }

        await firstValueFrom(
          this.http.put(`${this.apiUrl}/${this.editingAdminId}`, payload, { headers })
        );
        this.toastService.show('تم تحديث بيانات المدير بنجاح!', 'success');
      } else {
        const payload = {
          name: this.formData.name,
          email: this.formData.email,
          password: this.formData.password
        };

        await firstValueFrom(
          this.http.post(`${this.apiUrl}/createadmin`, payload, { headers })
        );
        this.toastService.show('تم إضافة المدير بنجاح!', 'success');
      }
      this.closeModal();
      this.loadAdmins();
    } catch (err: any) {
      console.error('Failed to save admin', err);
      const errMsg = err.error?.error || 'حدث خطأ أثناء حفظ البيانات. تأكد من كود التحقق الخاص بك.';
      this.toastService.show(errMsg, 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  async onDelete(id: string) {
    const code = prompt('هذه العملية خطيرة! يرجى إدخال كود التحقق الخاص بالسوبر أدمن لإتمام الحذف:');
    if (code === null) return;
    if (!code) {
      this.toastService.show('كود التحقق مطلوب لحذف المدير.', 'error');
      return;
    }

    try {
      const headers = new HttpHeaders().set('x-super-admin-code', code);
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/${id}`, { headers })
      );
      this.toastService.show('تم حذف المدير بنجاح!', 'success');
      this.loadAdmins();
    } catch (err: any) {
      console.error('Failed to delete admin', err);
      const errMsg = err.error?.error || 'فشل حذف المدير. تأكد من كود التحقق.';
      this.toastService.show(errMsg, 'error');
    }
  }
}
