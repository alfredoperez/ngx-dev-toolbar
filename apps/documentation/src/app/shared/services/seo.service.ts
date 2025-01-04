import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  twitterHandle?: string;
  blueskyHandle?: string;
  linkedInProfile?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(private meta: Meta, private title: Title) {}

  setData(config: SeoConfig) {
    // Default values
    const defaults: Partial<SeoConfig> = {
      image: 'assets/social-preview.png',
      type: 'website',
      author: 'Alfredo Perez',
      twitterHandle: '@alfrodo_perez',
      blueskyHandle: '@alfredoperez.bsky.social',
      linkedInProfile: 'https://www.linkedin.com/in/alfredo-perez',
      url: 'https://ngx-dev-toolbar.dev',
    };

    const seoConfig = { ...defaults, ...config };

    // Basic Meta Tags
    this.title.setTitle(seoConfig.title);
    this.meta.updateTag({
      name: 'description',
      content: seoConfig.description,
    });
    if (seoConfig.keywords) {
      this.meta.updateTag({
        name: 'keywords',
        content: seoConfig.keywords.join(', '),
      });
    }

    // OpenGraph Meta Tags
    this.meta.updateTag({ property: 'og:title', content: seoConfig.title });
    this.meta.updateTag({
      property: 'og:description',
      content: seoConfig.description,
    });
    this.meta.updateTag({ property: 'og:type', content: seoConfig.type! });
    this.meta.updateTag({ property: 'og:url', content: seoConfig.url! });
    this.meta.updateTag({ property: 'og:image', content: seoConfig.image! });

    // Twitter Meta Tags
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: seoConfig.title });
    this.meta.updateTag({
      name: 'twitter:description',
      content: seoConfig.description,
    });
    this.meta.updateTag({ name: 'twitter:image', content: seoConfig.image! });
    if (seoConfig.twitterHandle) {
      this.meta.updateTag({
        name: 'twitter:creator',
        content: seoConfig.twitterHandle,
      });
      this.meta.updateTag({
        name: 'twitter:site',
        content: seoConfig.twitterHandle,
      });
    }

    // Social Media Profiles
    if (seoConfig.linkedInProfile) {
      this.meta.updateTag({
        property: 'og:see_also',
        content: seoConfig.linkedInProfile,
      });
      this.meta.updateTag({
        name: 'linkedin:author',
        content: seoConfig.linkedInProfile,
      });
    }

    if (seoConfig.blueskyHandle) {
      this.meta.updateTag({
        name: 'bluesky:creator',
        content: seoConfig.blueskyHandle,
      });
    }

    // Additional Meta Tags
    if (seoConfig.author) {
      this.meta.updateTag({ name: 'author', content: seoConfig.author });
    }

    // Schema.org JSON-LD
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: seoConfig.title,
      description: seoConfig.description,
      author: {
        '@type': 'Person',
        name: seoConfig.author,
        url: seoConfig.url,
        sameAs: [
          seoConfig.linkedInProfile,
          `https://twitter.com/${seoConfig.twitterHandle?.replace('@', '')}`,
          `https://bsky.app/profile/${seoConfig.blueskyHandle?.replace(
            '@',
            ''
          )}`,
        ].filter(Boolean),
      },
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };

    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/ld+json';
    scriptElement.text = JSON.stringify(schema);
    document.head.appendChild(scriptElement);
  }
}
