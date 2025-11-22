import { Injectable, signal, computed } from '@angular/core';

/**
 * Product tier types representing different subscription levels
 */
export type ProductTier = 'basic' | 'professional' | 'enterprise';

/**
 * Service to manage product tier configurations and feature availability in the demo app.
 *
 * Demonstrates how app features can be used to test different product tiers
 * (like SaaS subscription levels) without changing backend configuration.
 */
@Injectable({
  providedIn: 'root',
})
export class AppFeaturesConfigService {
  /**
   * Current product tier (can be changed to test different scenarios)
   */
  public currentTier = signal<ProductTier>('basic');

  /**
   * Map of forced feature overrides (from dev toolbar)
   * When a feature is forced, it overrides the natural tier-based state
   */
  private forcedFeatures = signal<Map<string, boolean>>(new Map());

  /**
   * Feature definitions for each product tier
   */
  private readonly tierFeatures: Record<ProductTier, string[]> = {
    basic: [],
    professional: ['analytics', 'multi-user'],
    enterprise: [
      'analytics',
      'multi-user',
      'white-label',
      'sso-integration',
      'api-access',
    ],
  };

  /**
   * Feature metadata (names and descriptions for UI display)
   */
  private readonly featureMetadata: Record<
    string,
    { name: string; description: string }
  > = {
    analytics: {
      name: 'Analytics Dashboard',
      description: 'Advanced reporting and data visualization tools',
    },
    'multi-user': {
      name: 'Multi-User Support',
      description: 'Team collaboration and user management features',
    },
    'white-label': {
      name: 'White Label Branding',
      description: 'Customize app branding with your logo and colors',
    },
    'sso-integration': {
      name: 'SSO Integration',
      description: 'Single sign-on with enterprise identity providers',
    },
    'api-access': {
      name: 'API Access',
      description: 'Full REST API access for custom integrations',
    },
  };

  /**
   * Get all available features for the current tier with metadata
   */
  public availableFeatures = computed(() => {
    const tier = this.currentTier();
    const featureIds = this.tierFeatures[tier];

    return featureIds.map((id) => ({
      id,
      name: this.featureMetadata[id]?.name || id,
      description: this.featureMetadata[id]?.description || '',
      isEnabled: true, // All features in tier are naturally enabled
      isForced: false,
    }));
  });

  /**
   * Get all features across all tiers (for toolbar display)
   */
  public getAllFeatures() {
    const allFeatureIds = new Set<string>();
    Object.values(this.tierFeatures).forEach((features) =>
      features.forEach((id) => allFeatureIds.add(id))
    );

    const tier = this.currentTier();
    const enabledFeatures = this.tierFeatures[tier];

    return Array.from(allFeatureIds).map((id) => ({
      id,
      name: this.featureMetadata[id]?.name || id,
      description: this.featureMetadata[id]?.description || '',
      isEnabled: enabledFeatures.includes(id),
      isForced: false,
    }));
  }

  /**
   * Check if a specific feature is enabled (considering forced overrides)
   */
  public isFeatureEnabled(featureId: string): boolean {
    const forced = this.forcedFeatures();

    // If forced via toolbar, use forced state
    if (forced.has(featureId)) {
      return forced.get(featureId) ?? false;
    }

    // Otherwise, check if feature is in current tier
    const tier = this.currentTier();
    return this.tierFeatures[tier].includes(featureId);
  }

  /**
   * Force a feature to enabled/disabled state (called by dev toolbar integration)
   */
  public forceFeature(featureId: string, isEnabled: boolean): void {
    this.forcedFeatures.update((map) => {
      const newMap = new Map(map);
      newMap.set(featureId, isEnabled);
      return newMap;
    });
  }

  /**
   * Remove forced override for a feature
   */
  public clearForcedFeature(featureId: string): void {
    this.forcedFeatures.update((map) => {
      const newMap = new Map(map);
      newMap.delete(featureId);
      return newMap;
    });
  }

  /**
   * Clear all forced overrides
   */
  public clearAllForcedFeatures(): void {
    this.forcedFeatures.set(new Map());
  }

  /**
   * Set the product tier (for demo purposes)
   */
  public setTier(tier: ProductTier): void {
    this.currentTier.set(tier);
  }

  /**
   * Get tier display name
   */
  public getTierName(tier: ProductTier): string {
    const names: Record<ProductTier, string> = {
      basic: 'Basic Tier (Free)',
      professional: 'Professional Tier ($29/mo)',
      enterprise: 'Enterprise Tier ($99/mo)',
    };
    return names[tier];
  }

  /**
   * Get feature count for a tier
   */
  public getFeatureCount(tier: ProductTier): number {
    return this.tierFeatures[tier].length;
  }
}
