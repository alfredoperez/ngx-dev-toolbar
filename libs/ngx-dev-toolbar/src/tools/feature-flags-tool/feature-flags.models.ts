export interface DevToolbarFlag {
  id: string;
  name: string;
  description?: string;
  link?: string;
  isEnabled: boolean;
  isForced: boolean;
}

export type FeatureFlagFilter = 'all' | 'forced' | 'enabled' | 'disabled';
