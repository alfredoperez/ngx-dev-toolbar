import { Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const gtag: any;

@Injectable({providedIn: 'root'})
export class AnalyticsService {

  trackEvent(eventName: string, eventDetails: string, eventCategory: string) {
    gtag('event', eventName, {
    // event Type - example: 'SCROLL_TO_TOP_CLICKED'
    'event_category': eventCategory,
    // the label that will show up in the dashboard as the events name
    'event_label': eventName,
    // a short description of what happened
    'value': eventDetails
    })
  }
}