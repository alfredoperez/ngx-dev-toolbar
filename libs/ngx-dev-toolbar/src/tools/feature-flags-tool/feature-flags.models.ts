export interface ToolbarFlag {
  id: string;
  name: string;
  description?: string;
  link?: string;
  isEnabled: boolean;
  isForced: boolean;
  originalValue?: boolean;
  /** Optional group name. Items without a group render in an "Other" section. */
  group?: string;
}

export type FeatureFlagFilter = 'all' | 'forced' | 'enabled' | 'disabled';
