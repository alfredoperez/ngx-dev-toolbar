import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { AdditionalFeaturesSectionComponent } from './additional-features-section/additional-features-section.component';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { HeroSectionComponent } from './hero/hero-section.component';
import { HowToUseSectionComponent } from './how-to-use-section/how-to-use-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroSectionComponent,
    FeaturesSectionComponent,
    HowToUseSectionComponent,
    AdditionalFeaturesSectionComponent,
  ],
  template: `
    <app-hero-section />
    <app-features-section />
    <app-how-to-use-section />
    <app-additional-features-section />
  `,
})
export class LandingComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit() {
    this.seo.setData({
      title: 'Angular Toolbar - Supercharge Your Angular Development',
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
    });
  }
}
