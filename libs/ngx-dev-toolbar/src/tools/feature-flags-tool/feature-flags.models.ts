export interface ToolbarFlag {
  id: string;
  name: string;
  description?: string;
  link?: string;
  isEnabled: boolean;
  isForced: boolean;
  originalValue?: boolean;
}

export type FeatureFlagFilter = 'all' | 'forced' | 'enabled' | 'disabled';
