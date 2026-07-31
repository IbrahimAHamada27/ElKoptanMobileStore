import { Component, HostListener, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  isMenuOpen = false;
  isScrolled = false;
  isHomePage = false;
  hasSeenHero = false;
  isBrowser = false;
  touchStartY = 0;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.url === '/' || event.url === '/home';
        this.checkScroll();
      }
    });
  }

  ngOnInit() {
    this.isHomePage = this.router.url === '/' || this.router.url === '/home';
    this.checkScroll();
  }

  ngOnDestroy() {
    this.enableScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isHomePage && !this.hasSeenHero && this.isBrowser && window.scrollY > 10) {
      this.dismissHero();
    }
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.isHomePage && !this.hasSeenHero && event.deltaY > 0) {
      this.dismissHero();
    }
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.isHomePage && !this.hasSeenHero) {
      this.touchStartY = event.touches[0].clientY;
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isHomePage && !this.hasSeenHero) {
      const touchEndY = event.touches[0].clientY;
      if (this.touchStartY > touchEndY + 30) {
        this.dismissHero();
      }
    }
  }

  dismissHero() {
    this.hasSeenHero = true;
    this.isScrolled = true;
    this.enableScroll();
    if (this.isBrowser) {
      window.scrollTo(0, 0);
    }
  }

  checkScroll() {
    if (this.isHomePage && !this.hasSeenHero) {
      if (this.isBrowser) {
        if (window.scrollY > 50) {
          this.dismissHero();
        } else {
          this.disableScroll();
          this.isScrolled = false;
        }
      } else {
        this.isScrolled = false;
      }
    } else {
      this.isScrolled = true;
      this.enableScroll();
    }
  }

  disableScroll() {
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
    }
  }

  enableScroll() {
    if (this.isBrowser) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

