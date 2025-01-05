import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
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
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  setData(config: SeoConfig) {
    const seoConfig = { ...this.getDefaults(), ...config };

    this.setBasicMetaTags(seoConfig);
    this.setOpenGraphTags(seoConfig);
    this.setTwitterTags(seoConfig);
    this.setSocialProfileTags(seoConfig);
    this.setSchemaMarkup(seoConfig);
  }

  private getDefaults(): Partial<SeoConfig> {
    return {
      image: 'assets/social-preview.png',
      type: 'website',
      author: 'Alfredo Perez',
      twitterHandle: '@alfrodo_perez',
      blueskyHandle: '@alfredoperez.bsky.social',
      linkedInProfile: 'https://www.linkedin.com/in/alfredo-perez',
      url: 'https://ngx-dev-toolbar.dev',
    };
  }

  private setBasicMetaTags(config: SeoConfig): void {
    this.title.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });

    if (config.keywords?.length) {
      this.meta.updateTag({
        name: 'keywords',
        content: config.keywords.join(', '),
      });
    }

    if (config.author) {
      this.meta.updateTag({ name: 'author', content: config.author });
    }
  }

  private setOpenGraphTags(config: SeoConfig): void {
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({
      property: 'og:description',
      content: config.description,
    });
    this.meta.updateTag({ property: 'og:type', content: config.type! });
    this.meta.updateTag({ property: 'og:url', content: config.url! });
    this.meta.updateTag({ property: 'og:image', content: config.image! });
  }

  private setTwitterTags(config: SeoConfig): void {
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description,
    });
    this.meta.updateTag({ name: 'twitter:image', content: config.image! });
    if (config.twitterHandle) {
      this.meta.updateTag({
        name: 'twitter:creator',
        content: config.twitterHandle,
      });
      this.meta.updateTag({
        name: 'twitter:site',
        content: config.twitterHandle,
      });
    }
  }

  private setSocialProfileTags(config: SeoConfig): void {
    if (config.linkedInProfile) {
      this.meta.updateTag({
        property: 'og:see_also',
        content: config.linkedInProfile,
      });
      this.meta.updateTag({
        name: 'linkedin:author',
        content: config.linkedInProfile,
      });
    }

    if (config.blueskyHandle) {
      this.meta.updateTag({
        name: 'bluesky:creator',
        content: config.blueskyHandle,
      });
    }
  }

  private setSchemaMarkup(config: SeoConfig): void {
    if (!this.document.defaultView) {
      return;
    }

    const schema = this.createSchemaObject(config);
    this.updateJsonLdScript(schema);
  }

  private createSchemaObject(config: SeoConfig) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: config.title,
      description: config.description,
      author: {
        '@type': 'Person',
        name: config.author,
        url: config.url,
        sameAs: this.getSocialUrls(config),
      },
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };
  }

  private getSocialUrls(config: SeoConfig): string[] {
    return [
      config.linkedInProfile,
      config.twitterHandle &&
        `https://twitter.com/${config.twitterHandle.replace('@', '')}`,
      config.blueskyHandle &&
        `https://bsky.app/profile/${config.blueskyHandle.replace('@', '')}`,
    ].filter(Boolean) as string[];
  }

  private updateJsonLdScript(schema: object): void {
    const existingScripts = this.document.head.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    existingScripts.forEach((script) => script.remove());

    const scriptElement = this.document.createElement('script');
    scriptElement.type = 'application/ld+json';
    scriptElement.text = JSON.stringify(schema);
    this.document.head.appendChild(scriptElement);
  }
}
