import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  isMenuOpen = false;
  isScrolled = false;
  isHomePage = false;
  hasSeenHero = false;
  isBrowser = false;

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
    if (this.isBrowser) {
      this.hasSeenHero = sessionStorage.getItem('hasSeenHero') === 'true';
    }
    this.isHomePage = this.router.url === '/' || this.router.url === '/home';
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  checkScroll() {
    if (this.isHomePage && !this.hasSeenHero) {
      if (this.isBrowser) {
        this.isScrolled = window.scrollY > 50;
        if (this.isScrolled) {
          this.hasSeenHero = true;
          sessionStorage.setItem('hasSeenHero', 'true');
        }
      } else {
        this.isScrolled = false;
      }
    } else {
      this.isScrolled = true;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
