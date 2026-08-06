import { Component, signal, inject, AfterViewInit, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute, NavigationCancel, NavigationError } from '@angular/router';
import { ToastService } from './core/services/toast.service';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Meta } from '@angular/platform-browser';
import { MetaPixelService } from './core/services/meta-pixel.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnInit, OnDestroy {
  toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private meta = inject(Meta);
  private metaPixelService = inject(MetaPixelService);
  protected readonly title = signal('Al-Qubtan');
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.metaPixelService.initialize();

    const loaderSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)
    ).subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        const loader = document.getElementById('app-initial-loader');
        if (loader) {
          loader.style.transition = 'opacity 0.3s ease';
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 300);
        }
      }
    });

    const pixelSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.metaPixelService.pageView();
    });

    const metaSub = this.router.events.pipe(
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

    this.subscriptions.push(loaderSub, pixelSub, metaSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
  }
}
