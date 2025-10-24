/**
 * Represents a permission in the developer toolbar.
 * Used to configure and override application permissions for testing.
 */
export interface DevToolbarPermission {
  /** Unique identifier for the permission */
  id: string;
  /** Human-readable name displayed in the UI */
  name: string;
  /** Optional description explaining the permission's purpose */
  description?: string;
  /** Whether the permission is currently granted */
  isGranted: boolean;
  /** Whether the permission's value has been overridden through the toolbar */
  isForced: boolean;
  /** Original value before forcing (only present when isForced is true) */
  originalValue?: boolean;
}

/**
 * Internal state representing forced permission overrides.
 * Persisted to localStorage for session continuity.
 */
export interface ForcedPermissionsState {
  /** Array of permission IDs that are forced to granted */
  granted: string[];
  /** Array of permission IDs that are forced to denied */
  denied: string[];
}

/**
 * Filter options for displaying permissions in the tool.
 */
export type PermissionFilter = 'all' | 'forced' | 'granted' | 'denied';

/**
 * Permission value options for the dropdown control.
 */
export type PermissionValue = 'not-forced' | 'granted' | 'denied';
