/**
 * Configuration options for the Dev Toolbar component.
 * All tool flags are optional and default to true if not specified.
 */
export interface DevToolbarConfig {
  /**
   * Show/hide the Language tool
   * @default true
   */
  showLanguageTool?: boolean;

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
}
