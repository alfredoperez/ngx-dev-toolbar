/**
 * Configuration options for the Dev Toolbar component.
 * All tool flags are optional and default to true if not specified.
 */
export interface DevToolbarConfig {
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
