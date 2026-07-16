import { Routes } from '@angular/router';
import { CanDeactivateFn, ResolveFn, CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductService } from './core/services/product.service';
import { AuthService } from './core/services/auth.service';

export const productsResolver: ResolveFn<boolean> = async (route, state) => {
  const productService = inject(ProductService);
  if (productService.products().length === 0) {
    await productService.loadProducts();
  }
  return true;
};

export const unsavedChangesGuard: CanDeactivateFn<any> = (component) => {
  if (component.hasUnsavedChanges) {
    return window.confirm('لديك تعديلات لم يتم حفظها. هل أنت متأكد من رغبتك في المغادرة؟');
  }
  return true;
};

/**
 * يحمي مسارات الداشبورد:
 * - لو مسجل دخول → يكمل
 * - لو مش مسجل → يوديه لصفحة الـ login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true; // SSR

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }
  return router.parseUrl('/login');
};

/**
 * يحمي صفحة الـ Login:
 * - لو مسجل دخول فعلاً → يوديه للداشبورد مباشرة
 * - لو مش مسجل → يخليه في صفحة الـ login
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true; // SSR

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    const destination = authService.isSuperAdmin ? '/admin/admins' : '/admin';
    return router.parseUrl(destination);
  }
  return true;
};

export const superAdminGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true; // SSR

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSuperAdmin) {
    return true;
  }
  return router.parseUrl('/admin');
};

export const adminOnlyGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true; // SSR

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.role === 'admin') {
    return true;
  }
  return router.parseUrl('/admin/admins');
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/user-layout/user-layout').then(m => m.UserLayout),
    resolve: { productsLoaded: productsResolver },
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home), title: 'الرئيسية | القبطان موبايل ستور', data: { description: 'أفضل متجر لبيع وشراء الهواتف المحمولة والاكسسوارات في مصر' } },
      { path: 'product/:id', loadComponent: () => import('./pages/product-details/product-details').then(m => m.ProductDetails), title: 'تفاصيل المنتج | القبطان موبايل ستور', data: { description: 'تفاصيل المنتج ومواصفاته' } },
      { path: 'cart', loadComponent: () => import('./pages/cart/cart').then(m => m.Cart), title: 'سلة المشتريات | القبطان موبايل ستور', data: { description: 'عربة التسوق الخاصة بك' } },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact), title: 'التواصل | القبطان موبايل ستور', data: { description: 'تواصل معنا لأي استفسار' } },
      { path: 'cash', loadComponent: () => import('./pages/cash/cash').then(m => m.Cash), title: 'الدفع | القبطان موبايل ستور' },
      { path: 'maintenance', loadComponent: () => import('./pages/maintenance/maintenance').then(m => m.Maintenance), title: 'الصيانة | القبطان موبايل ستور', data: { description: 'خدمات صيانة الموبايلات والالكترونيات' } },
      { path: 'phones', loadComponent: () => import('./pages/phones/phones').then(m => m.Phones), title: 'الهواتف | القبطان موبايل ستور', data: { description: 'تصفح أحدث الهواتف الذكية بأسعار خيالية' } },
      { path: 'accessories', loadComponent: () => import('./pages/accessories/accessories').then(m => m.Accessories), title: 'الإكسسوارات | القبطان موبايل ستور', data: { description: 'أفضل إكسسوارات الجوال' } },
      { path: 'faq', loadComponent: () => import('./pages/faq/faq').then(m => m.Faq), title: 'الأسئلة الشائعة | القبطان موبايل ستور' },
      { path: 'offers', loadComponent: () => import('./pages/offers/offers').then(m => m.Offers), title: 'العروض المميزة | القبطان موبايل ستور', data: { description: 'عروض حصرية وخصومات' } }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    title: 'تسجيل الدخول | لوحة تحكم القبطان',
    canActivate: [loginGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./dashboard/layout/layout').then(m => m.DashboardLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/home/home').then(m => m.DashboardHome),
        title: 'الإحصائيات | لوحة تحكم القبطان',
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'products/:category',
        loadComponent: () => import('./dashboard/products/products').then(m => m.DashboardProducts),
        title: 'إدارة المنتجات | لوحة تحكم القبطان',
        canDeactivate: [unsavedChangesGuard],
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'add-product',
        loadComponent: () => import('./dashboard/product-form/product-form').then(m => m.ProductForm),
        title: 'إضافة منتج | لوحة تحكم القبطان',
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'edit-product/:id',
        loadComponent: () => import('./dashboard/product-form/product-form').then(m => m.ProductForm),
        title: 'تعديل منتج | لوحة تحكم القبطان',
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'settings/faq',
        loadComponent: () => import('./dashboard/settings/faq/faq').then(m => m.DashboardFaq),
        title: 'إدارة الأسئلة الشائعة | لوحة تحكم القبطان',
        canDeactivate: [unsavedChangesGuard],
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'settings/contact',
        loadComponent: () => import('./dashboard/settings/contact/contact').then(m => m.DashboardContact),
        title: 'إدارة بيانات التواصل | لوحة تحكم القبطان',
        canDeactivate: [unsavedChangesGuard],
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'settings/maintenance',
        loadComponent: () => import('./dashboard/settings/maintenance/maintenance').then(m => m.DashboardMaintenance),
        title: 'إدارة الصيانة | لوحة تحكم القبطان',
        canDeactivate: [unsavedChangesGuard],
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'settings/featured',
        loadComponent: () => import('./dashboard/settings/featured/featured').then(m => m.DashboardFeatured),
        title: 'إدارة الرئيسية والعروض | لوحة تحكم القبطان',
        canDeactivate: [unsavedChangesGuard],
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'settings/payment',
        loadComponent: () => import('./dashboard/settings/payment/payment').then(m => m.DashboardPayment),
        title: 'إدارة طرق الدفع | لوحة تحكم القبطان',
        canDeactivate: [unsavedChangesGuard],
        canActivate: [adminOnlyGuard]
      },
      {
        path: 'admins',
        loadComponent: () => import('./dashboard/admins/admins').then(m => m.DashboardAdmins),
        title: 'إدارة المدراء | لوحة تحكم القبطان',
        canActivate: [superAdminGuard]
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound),
    title: 'الصفحة غير موجودة'
  }
];
