import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object | object[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  private readonly siteName = 'القبطان موبايل ستور | Elkoptan Mobile Store';
  private readonly defaultBaseUrl = 'https://elkoptan-mobile.com';
  private readonly defaultImage = 'https://elkoptan-mobile.com/assets/images/logo.jpg';

  // All 5 Official Branches Data
  public readonly branches = [
    {
      name: 'فرع محور السادات - سنتر جواهر',
      address: 'مدينة العبور - الحي الأول - محور السادات بجوار فرع فودافون بداخل سنتر جواهر - الدور الأول علوي',
      phone: '01034777762',
      type: 'Sales & Accessories',
      mapUrl: 'https://share.google/8RG0VQSHXznb9AS7m'
    },
    {
      name: 'فرع سنتر الشروق (Number 1)',
      address: 'مدينة العبور - الحي الأول - سنتر الشروق - بجوار كشري الخديوي',
      phone: '01034777762',
      type: 'Sales & Accessories',
      mapUrl: 'https://share.google/pECvTwJ67w798GteO'
    },
    {
      name: 'المركز الرئيسي للصيانة المعتمدة',
      address: 'مدينة العبور - الحي الأول - المركز العالمي للتطوير - بجوار كشري الخديوي',
      phone: '01031777762',
      type: 'Maintenance Center',
      mapUrl: 'https://share.google/GAxAfoiHdJk1tTdrq'
    },
    {
      name: 'فرع سنتر اللؤلؤة (محل 14)',
      address: 'مدينة العبور - الحي الأول - سنتر اللؤلؤة - محل 14 - بدروم خلفي - بجوار محل دلعين',
      phone: '01034777762',
      type: 'Sales & Accessories',
      mapUrl: 'https://share.google/8RG0VQSHXznb9AS7m'
    },
    {
      name: 'فرع سوق العبور بالجملة',
      address: 'مدينة العبور - سوق العبور للجملة - مبنى خدمات 3 بجوار مسجد الرحمن الرحيم محل 57',
      phone: '01034777762',
      type: 'Wholesale & Retail',
      mapUrl: 'https://share.google/pECvTwJ67w798GteO'
    }
  ];

  // Comprehensive Multi-Branch LocalBusiness JSON-LD Schema
  public readonly localBusinessData = {
    '@context': 'https://schema.org',
    '@type': 'MobilePhoneStore',
    '@id': `${this.defaultBaseUrl}/#organization`,
    'name': 'القبطان موبايل ستور',
    'alternateName': ['Elkoptan Mobile Store', 'محل القبطان للموبايلات', 'القبطان ستور', 'El Koptan Store'],
    'url': this.defaultBaseUrl,
    'logo': this.defaultImage,
    'image': this.defaultImage,
    'description': 'أفضل محل موبايلات واكسسوارات وصيانة هواتف ذكية (آيفون، سامسونج، شاومي، ريلمي، أوبو) بـ 5 فروع في مدينة العبور وسوق العبور والقليوبية.',
    'telephone': '+201034777762',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'مدينة العبور - الحي الأول - محور السادات - سنتر جواهر',
      'addressLocality': 'مدينة العبور',
      'addressRegion': 'القليوبية',
      'postalCode': '13811',
      'addressCountry': 'EG'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '30.2289',
      'longitude': '31.4728'
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        'opens': '09:00',
        'closes': '00:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Friday'],
        'opens': '13:00',
        'closes': '00:00'
      }
    ],
    'sameAs': [
      'https://www.facebook.com/share/1XKmJ1R7vV/?mibextid=wwXIfr',
      'https://www.instagram.com/el_koptan_store1?igsh=cWJhMTMzbW42emJm&utm_source=qr',
      'https://www.tiktok.com/@el_koptan_stor?_r=1&_t=ZS-97TeCUoF0g1',
      'https://share.google/8RG0VQSHXznb9AS7m',
      'https://share.google/pECvTwJ67w798GteO',
      'https://share.google/GAxAfoiHdJk1tTdrq'
    ],
    'department': this.branches.map(b => ({
      '@type': 'MobilePhoneStore',
      'name': `القبطان موبايل ستور - ${b.name}`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': b.address,
        'addressLocality': 'مدينة العبور',
        'addressRegion': 'القليوبية',
        'addressCountry': 'EG'
      },
      'telephone': b.phone,
      'hasMap': b.mapUrl
    }))
  };

  /**
   * Sets up full page SEO including Title, Description, Canonical, OG, Twitter, and JSON-LD
   */
  setPageSeo(config: SeoConfig) {
    const fullTitle = config.title.includes('القبطان') ? config.title : `${config.title} | ${this.siteName}`;
    const pageUrl = config.url ? (config.url.startsWith('http') ? config.url : `${this.defaultBaseUrl}${config.url}`) : this.defaultBaseUrl;
    const imageUrl = config.image ? (config.image.startsWith('http') ? config.image : `${this.defaultBaseUrl}/${config.image.replace(/^\//, '')}`) : this.defaultImage;
    const defaultKeywords = 'محل موبيلات في العبور, محل موبايلات في العبور, محل موبيلات العبور, محل موبايلات العبور, محل موبيلات في العبور الحي الأول, اكسسوارات موبايلات في العبور, صيانة موبايلات في العبور, تصليح موبايلات العبور, شراء موبايل في العبور, أفضل محل موبايلات في العبور, هواتف في العبور, ايفون في العبور, سامسونج في العبور, شاومي في العبور, ريلمي في العبور, اوبو في العبور, Elkoptan Mobile Store';
    const keywords = config.keywords ? `${config.keywords}, ${defaultKeywords}` : defaultKeywords;

    // Title
    this.titleService.setTitle(fullTitle);

    // Meta Tags
    this.metaService.updateTag({ name: 'description', content: config.description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    this.metaService.updateTag({ name: 'author', content: 'القبطان موبايل ستور' });

    // OpenGraph Tags
    this.metaService.updateTag({ property: 'og:site_name', content: 'القبطان موبايل ستور' });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:locale', content: 'ar_EG' });

    // Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });

    // Canonical Link
    this.setCanonicalUrl(pageUrl);

    // Dynamic JSON-LD Schema
    if (config.jsonLd) {
      this.injectJsonLd(config.jsonLd);
    }
  }

  /**
   * Updates canonical link tag dynamically
   */
  setCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Inject dynamic JSON-LD structured data inside <head>
   */
  injectJsonLd(schemaData: object | object[]) {
    const existingScript = this.document.querySelector("script[type='application/ld+json'][id='page-jsonld']");
    if (existingScript) {
      existingScript.remove();
    }

    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', 'page-jsonld');
    script.textContent = JSON.stringify(schemaData);
    this.document.head.appendChild(script);
  }

  /**
   * Helper to build WebSite Schema
   */
  getWebSiteSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${this.defaultBaseUrl}/#website`,
      'url': this.defaultBaseUrl,
      'name': 'القبطان موبايل ستور',
      'alternateName': ['Elkoptan Mobile Store', 'El Koptan Store', 'القبطان ستور'],
      'description': 'أفضل محل موبايلات واكسسوارات وخدمات الصيانة المعتمدة في مدينة العبور وبجوار سنتر جواهر وسنتر الشروق وسوق العبور',
      'inLanguage': 'ar-EG',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${this.defaultBaseUrl}/phones?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Helper to build BreadcrumbList Schema
   */
  getBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url.startsWith('http') ? item.url : `${this.defaultBaseUrl}${item.url}`
      }))
    };
  }

  /**
   * Helper to build Product Schema
   */
  getProductSchema(product: {
    name: string;
    description?: string;
    image?: string;
    price: number;
    discountPrice?: number;
    url: string;
    category?: string;
    isStock?: boolean;
  }) {
    const finalPrice = product.discountPrice || product.price;
    const imageUrl = product.image ? (product.image.startsWith('http') ? product.image : `${this.defaultBaseUrl}/${product.image.replace(/^\//, '')}`) : this.defaultImage;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.description || `شراء ${product.name} بأفضل سعر من القبطان موبايل ستور بمدينة العبور.`,
      'image': [imageUrl],
      'category': product.category || 'Mobile Phone',
      'brand': {
        '@type': 'Brand',
        'name': 'القبطان موبايل ستور'
      },
      'offers': {
        '@type': 'Offer',
        'url': product.url.startsWith('http') ? product.url : `${this.defaultBaseUrl}${product.url}`,
        'priceCurrency': 'EGP',
        'price': finalPrice,
        'priceValidUntil': '2026-12-31',
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.isStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'القبطان موبايل ستور'
        }
      }
    };
  }
}
