import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class DashboardLayout implements OnInit, OnDestroy {
  authService = inject(AuthService);

  get role(): string | null {
    return this.authService.role;
  }

  ngOnInit(): void {
    // يبدأ مؤقت الخمول ويسجل أحداث النشاط
    this.authService.initSession();
  }

  ngOnDestroy(): void {
    // ينظف المؤقت وأحداث النشاط عند مغادرة الداشبورد
    this.authService.destroySession();
  }

  logout(): void {
    this.authService.logout();
  }
}
