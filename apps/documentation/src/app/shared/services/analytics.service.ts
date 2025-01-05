import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly GTM_ID = 'GTM-XXXXXX'; // Replace with your GTM ID

  initialize(): void {
    this.setupGoogleTagManager();
    this.trackPageViews();
  }

  trackEvent(eventName: string, eventParams?: Record<string, any>): void {
    window.dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }

  private setupGoogleTagManager(): void {
    window.dataLayer = window.dataLayer || [];

    const script = this.document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${this.GTM_ID}');
    `;

    this.document.head.appendChild(script);
  }

  private trackPageViews(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.trackEvent('page_view', {
          page_path: event.urlAfterRedirects,
          page_title: this.document.title,
        });
      });
  }
}
