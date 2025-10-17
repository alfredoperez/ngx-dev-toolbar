export interface DevToolbarPreset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  config: DevToolbarPresetConfig;
}

export interface DevToolbarPresetConfig {
  featureFlags: {
    enabled: string[];
    disabled: string[];
  };
  language: string | null;
  permissions: {
    granted: string[];
    denied: string[];
  };
  appFeatures: {
    enabled: string[];
    disabled: string[];
  };
}

export type PresetFilter = 'all' | 'recent' | 'favorites';
