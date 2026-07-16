import { Component, signal, inject, AfterViewInit, PLATFORM_ID, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ToastService } from './core/services/toast.service';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnInit {
  toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private meta = inject(Meta);
  protected readonly title = signal('Al-Qubtan');

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      if (data['description']) {
        this.meta.updateTag({ name: 'description', content: data['description'] });
      } else {
        this.meta.updateTag({ name: 'description', content: 'متجر القبطان موبايل ستور - وجهتك الأولى لشراء أحدث الهواتف المحمولة والإكسسوارات الأصلية بأفضل الأسعار وأقوى العروض في مصر.' });
      }
    });
  }

  ngAfterViewInit(): void {
    // نمسح شاشة التحميل فور ما Angular يبدأ يشتغل
    if (isPlatformBrowser(this.platformId)) {
      const loader = document.getElementById('app-initial-loader');
      if (loader) {
        // fade out سلس
        loader.style.transition = 'opacity 0.3s ease';
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }
    }
  }
}
