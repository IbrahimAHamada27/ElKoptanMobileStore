import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

/**
 * مدة الخمول قبل تسجيل الخروج التلقائي (بالميللي ثانية)
 * - الأدمن العادي: 60 دقيقة
 * - السوبر أدمن: 5 دقائق
 */
const ADMIN_TIMEOUT_MS = 60 * 60 * 1000;       // ساعة واحدة
const SUPER_ADMIN_TIMEOUT_MS = 5 * 60 * 1000;  // 5 دقائق

/** أحداث النشاط التي تُعيد ضبط مؤقت الخمول */
const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'touchstart', 'scroll', 'click'
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Getters ────────────────────────────────────────────────────────────────

  get token(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token');
  }

  get role(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('role');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get isSuperAdmin(): boolean {
    return this.role === 'superadmin';
  }

  // ─── Session Management ──────────────────────────────────────────────────────

  /** يُحفظ بيانات الجلسة ويبدأ مؤقت الخمول */
  saveSession(token: string, role: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    this.startInactivityTimer();
  }

  /** يُسجّل الخروج ويحذف بيانات الجلسة */
  logout(showMessage = false): void {
    this.stopInactivityTimer();
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  /**
   * يُشغَّل هذا عند دخول الـ Dashboard Layout.
   * يسجل أحداث النشاط ويبدأ المؤقت.
   */
  initSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.startInactivityTimer();
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, this.resetTimer, { passive: true });
    });
  }

  /**
   * يُشغَّل عند تدمير الـ Dashboard Layout.
   * يوقف المؤقت ويُزيل مستمعي الأحداث.
   */
  destroySession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopInactivityTimer();
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, this.resetTimer);
    });
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private get timeoutDuration(): number {
    return this.isSuperAdmin ? SUPER_ADMIN_TIMEOUT_MS : ADMIN_TIMEOUT_MS;
  }

  private startInactivityTimer(): void {
    this.stopInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      this.logout();
    }, this.timeoutDuration);
  }

  private stopInactivityTimer(): void {
    if (this.inactivityTimer !== null) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /** Arrow function لضمان صحة الـ `this` عند استخدامها كـ event listener */
  private resetTimer = (): void => {
    this.startInactivityTimer();
  };
}
