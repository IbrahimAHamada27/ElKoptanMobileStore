import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Setting {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/setting`;

  // Signals for caching the data globally
  faqSignal = signal<any[]>([]);
  contactSignal = signal<any>({});
  maintenanceSignal = signal<any>({ services: [], numbers: [], locations: [] });
  featuredProductsSignal = signal<{home: string[], offers: string[]}>({home: [], offers: []});
  paymentSignal = signal<any>({
    instapayPhone: '',
    instapayAccountName: '',
    instapayDisplayName: '',
    instapayLink: 'instapay://',
    vodafonePhone: '',
    orangePhone: '',
    etisalatPhone: '',
    wePhone: ''
  });

  constructor() {
    this.loadAllSettings();
  }

  async loadAllSettings() {
    try {
      const response: any = await firstValueFrom(this.http.get(this.apiUrl));
      if (response && response.success && response.data) {
        if (response.data.faq) this.faqSignal.set(response.data.faq);
        if (response.data.contact) this.contactSignal.set(response.data.contact);
        if (response.data.maintenance) this.maintenanceSignal.set(response.data.maintenance);
        if (response.data.featured_products) this.featuredProductsSignal.set(response.data.featured_products);
        if (response.data.payment) this.paymentSignal.set(response.data.payment);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  }

  async updateSetting(key: string, value: any) {
    try {
      const response: any = await firstValueFrom(this.http.put(`${this.apiUrl}/${key}`, { value }));
      if (response && response.success) {
        if (key === 'faq') this.faqSignal.set(response.data);
        if (key === 'contact') this.contactSignal.set(response.data);
        if (key === 'maintenance') this.maintenanceSignal.set(response.data);
        if (key === 'featured_products') this.featuredProductsSignal.set(response.data);
        if (key === 'payment') this.paymentSignal.set(response.data);
      }
    } catch (error) {
      console.error(`Failed to update ${key}`, error);
      throw error;
    }
  }
}
