import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

// Type definitions for Meta Pixel global variables
interface MetaWindow extends Window {
  fbq: {
    (...args: unknown[]): void;
    callMethod?: (...args: unknown[]) => void;
    queue: unknown[];
    push: unknown;
    loaded: boolean;
    version: string;
  };
  _fbq: unknown;
}

declare let window: MetaWindow;

export interface CurrencyData {
  currency: string;
  value: number;
}

export interface ContentData {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
}

export interface MetaPurchaseData extends CurrencyData, ContentData {
  num_items?: number;
}

export interface MetaAddToCartData extends CurrencyData, ContentData {}

export interface MetaInitiateCheckoutData extends CurrencyData, ContentData {
  num_items?: number;
}

export interface MetaSearchData {
  search_string: string;
}

export type MetaEventData = 
  | MetaPurchaseData 
  | MetaAddToCartData 
  | MetaInitiateCheckoutData 
  | MetaSearchData
  | (ContentData & Partial<CurrencyData>)
  | Record<string, string | number | boolean | string[]>;

@Injectable({
  providedIn: 'root'
})
export class MetaPixelService {
  private isBrowser: boolean;
  private isInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  initialize(): void {
    if (!this.isBrowser || this.isInitialized) {
      return;
    }

    const pixelId = environment.pixelId;
    if (!pixelId || pixelId === 'YOUR_PIXEL_ID') {
      console.warn('Meta Pixel ID is not configured.');
      return;
    }

    // Inject Meta Pixel Script
    const f = window;
    const b = document;
    const e = 'script';
    const v = 'https://connect.facebook.net/en_US/fbevents.js';

    if (f.fbq) return;

    const n = f.fbq = function(...args: unknown[]): void {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue.push(args);
      }
    };

    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    const t = b.createElement(e);
    t.async = true;
    t.src = v;

    const s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else {
      b.head.appendChild(t);
    }

    window.fbq('init', pixelId);
    this.isInitialized = true;
  }

  private track(eventName: string, data?: MetaEventData): void {
    if (!this.isBrowser || !window.fbq) {
      return;
    }
    if (data) {
      window.fbq('track', eventName, data);
    } else {
      window.fbq('track', eventName);
    }
  }

  pageView(): void {
    this.track('PageView');
  }

  viewContent(data?: ContentData & Partial<CurrencyData>): void {
    this.track('ViewContent', data);
  }

  addToCart(data?: MetaAddToCartData): void {
    this.track('AddToCart', data);
  }

  initiateCheckout(data?: MetaInitiateCheckoutData): void {
    this.track('InitiateCheckout', data);
  }

  purchase(data: MetaPurchaseData): void {
    this.track('Purchase', data);
  }

  lead(data?: Record<string, string | number | boolean>): void {
    this.track('Lead', data);
  }

  completeRegistration(data?: Record<string, string | number | boolean>): void {
    this.track('CompleteRegistration', data);
  }

  contact(data?: Record<string, string | number | boolean>): void {
    this.track('Contact', data);
  }

  search(data: MetaSearchData): void {
    this.track('Search', data);
  }
}
