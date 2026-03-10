import { ToolbarPosition } from './toolbar-position.model';

/**
 * Configuration options for the Angular Toolbar component.
 * All tool flags are optional and default to true if not specified.
 */
export interface ToolbarConfig {
  /**
   * Position of the toolbar on the viewport edge.
   * @default 'bottom'
   */
  position?: ToolbarPosition;
  /**
   * Master switch to enable/disable the entire toolbar.
   * When disabled:
   * - Toolbar UI will not render
   * - All tool services will preserve localStorage data but won't return forced values
   * - Developers can still call setAvailableOptions() safely (no-op when disabled)
   * @default true
   */
  enabled?: boolean;

  /**
   * Show/hide the i18n tool (locale, timezone, currency, pseudo-localization, RTL)
   * @default true
   */
  showI18nTool?: boolean;

  /**
   * Show/hide the Feature Flags tool
   * @default true
   */
  showFeatureFlagsTool?: boolean;

  /**
   * Show/hide the App Features tool
   * @default true
   */
  showAppFeaturesTool?: boolean;

  /**
   * Show/hide the Permissions tool
   * @default true
   */
  showPermissionsTool?: boolean;

  /**
   * Show/hide the Presets tool
   * @default true
   */
  showPresetsTool?: boolean;

  /**
   * Callback to persist a forced feature flag value to the actual source.
   * When provided, an "Apply to source" button appears on each forced flag.
   * @param flagId - The ID of the feature flag
   * @param value - The current forced boolean value
   */
  onApplyFeatureFlag?: (flagId: string, value: boolean) => Promise<void>;

  /**
   * Callback to persist a forced permission value to the actual source.
   * When provided, an "Apply to source" button appears on each forced permission.
   * @param permissionId - The ID of the permission
   * @param value - The current forced boolean value (granted = true, denied = false)
   */
  onApplyPermission?: (permissionId: string, value: boolean) => Promise<void>;

  /**
   * Callback to persist a forced app feature value to the actual source.
   * When provided, an "Apply to source" button appears on each forced feature.
   * @param featureId - The ID of the app feature
   * @param value - The current forced boolean value
   */
  onApplyAppFeature?: (featureId: string, value: boolean) => Promise<void>;
}
