import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { HeroSectionComponent } from './hero/hero-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [HeroSectionComponent, FeaturesSectionComponent],
  template: `
    <app-hero-section />
    <app-features-section />
  `,
})
export class LandingComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit() {
    this.seo.setData({
      title: 'ngx-dev-toolbar - Supercharge Your Angular Development',
      description:
        'A powerful development toolbar for Angular applications that helps developers interact with their application in a more efficient way. Toggle features, switch languages, and mock data - all without leaving your browser.',
      keywords: [
        'Angular',
        'Development Tools',
        'Feature Flags',
        'Language Switching',
        'Development Toolbar',
        'Angular Development',
        'Custom Tools',
        'Developer Experience',
        'DX',
        'Angular Library',
        'Angular DevTools',
        'Angular Development Environment',
      ],
      image: 'assets/social-preview.png',
      type: 'website',
      author: 'Alfredo Perez',
      twitterHandle: '@alfrodo_perez',
      blueskyHandle: '@alfredoperez.bsky.social',
      linkedInProfile: 'https://www.linkedin.com/in/alfredo-perez',
      url: 'https://ngx-dev-toolbar.dev',
    });
  }
}
