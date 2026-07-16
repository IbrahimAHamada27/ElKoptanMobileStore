import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-circle">⚓</div>
          <h2>لوحة تحكم القبطان</h2>
          <p>تسجيل الدخول لإدارة المتجر</p>
        </div>
        
        <form (submit)="onSubmit($event)" class="login-form">
          <ng-container *ngIf="!requireMfa()">
            <div class="form-group">
              <label for="email">البريد الإلكتروني</label>
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  [(ngModel)]="email" 
                  placeholder="admin@example.com" 
                  required 
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password">كلمة المرور</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  [(ngModel)]="password" 
                  placeholder="••••••••" 
                  required 
                  class="form-control"
                />
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="requireMfa()">
            <div class="form-group">
              <label for="otpCode">رمز التحقق الثنائي (MFA)</label>
              <div class="input-wrapper">
                <span class="input-icon">📱</span>
                <input 
                  type="text" 
                  id="otpCode" 
                  name="otpCode" 
                  [(ngModel)]="otpCode" 
                  placeholder="123456" 
                  required 
                  class="form-control"
                />
              </div>
            </div>
          </ng-container>

          <button type="submit" class="btn-login" [disabled]="isLoading()">
            {{ isLoading() ? 'جاري التحقق...' : (requireMfa() ? 'تحقق' : 'تسجيل الدخول') }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      padding: 20px;
    }

    .login-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
      max-width: 420px;
      padding: 40px 30px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    .login-header {
      margin-bottom: 30px;
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: white;
      font-size: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin: 0 auto 15px auto;
      box-shadow: 0 8px 20px rgba(217, 119, 6, 0.3);
    }

    .login-header h2 {
      color: #fff;
      margin: 0 0 8px 0;
      font-size: 1.6rem;
      font-weight: 700;
    }

    .login-header p {
      color: #94a3b8;
      margin: 0;
      font-size: 0.95rem;
    }

    .login-form {
      text-align: right;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      color: #cbd5e1;
      margin-bottom: 8px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      right: 12px;
      color: #64748b;
      font-size: 1.1rem;
    }

    .form-control {
      width: 100%;
      padding: 12px 40px 12px 15px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: white;
      font-family: inherit;
      font-size: 0.95rem;
      transition: all 0.3s;
    }

    .form-control:focus {
      border-color: #d97706;
      outline: none;
      box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.25);
    }

    .btn-login {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      border: none;
      border-radius: 8px;
      color: white;
      font-family: inherit;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 10px;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
    }

    .btn-login:hover:not([disabled]) {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(217, 119, 6, 0.35);
    }

    .btn-login:disabled {
      background: #475569;
      cursor: not-allowed;
      box-shadow: none;
      color: #94a3b8;
    }
  `]
})
export class Login {
  router = inject(Router);
  http = inject(HttpClient);
  toastService = inject(ToastService);
  authService = inject(AuthService);

  email = '';
  password = '';
  otpCode = '';
  isLoading = signal(false);
  requireMfa = signal(false);
  tempToken = '';

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.requireMfa()) {
      return this.verifyMfa();
    }

    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    try {
      const apiUrl = `${environment.apiUrl}/auth/login`;
      const response: any = await firstValueFrom(
        this.http.post(apiUrl, { email: this.email, password: this.password })
      );

      if (response && response.requireMfa) {
        this.requireMfa.set(true);
        this.tempToken = response.tempToken;
        this.toastService.show('يرجى إدخال رمز التحقق الثنائي (MFA)', 'info');
      } else if (response && response.jwt) {
        this.handleSuccessLogin(response);
      } else {
        this.toastService.show('فشل تسجيل الدخول، لم يتم استلام رمز التحقق.', 'error');
      }
    } catch (error: any) {
      console.error('Login failed', error);
      let errMsg = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
      if (error.status === 0) {
        errMsg = 'خطأ في الاتصال بالخادم. تأكد من تشغيل الباك إند.';
      }
      this.toastService.show(errMsg, 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async verifyMfa() {
    if (!this.otpCode) return;
    this.isLoading.set(true);
    try {
      const apiUrl = `${environment.apiUrl}/auth/mfa/verify`;
      const response: any = await firstValueFrom(
        this.http.post(apiUrl, { token: this.otpCode, tempToken: this.tempToken })
      );

      if (response && response.jwt) {
        this.handleSuccessLogin(response);
      } else {
         this.toastService.show('رمز التحقق غير صحيح.', 'error');
      }
    } catch (error: any) {
      console.error('MFA Verify failed', error);
      this.toastService.show('رمز التحقق غير صحيح.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleSuccessLogin(response: any) {
      const role = response.role || 'admin';
      this.authService.saveSession(response.jwt, role);
      this.toastService.show('تم تسجيل الدخول بنجاح!', 'success');
      const destination = role === 'superadmin' ? '/admin/admins' : '/admin';
      this.router.navigate([destination]);
  }
}
