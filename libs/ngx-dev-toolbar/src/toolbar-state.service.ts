import { Injectable, computed, signal } from '@angular/core';
import { ToolbarConfig } from './models/toolbar-config.interface';

interface ToolbarState {
  isHidden: boolean;
  activeToolId: string | null;
  error: string | null;
  theme: 'light' | 'dark';
  delay: number;
  config: ToolbarConfig;
}

@Injectable({
  providedIn: 'root',
})
export class ToolbarStateService {
  // Initial state
  private state = signal<ToolbarState>({
    isHidden: true,
    activeToolId: null,
    delay: 3000,
    error: null,
    theme: 'dark',
    config: {},
  });

  // Selectors
  readonly isVisible = computed(
    () => !this.state().isHidden || this.hasActiveTool()
  );
  readonly isDarkTheme = computed(() => this.state().theme === 'dark');
  readonly activeToolId = computed(() => this.state().activeToolId);
  readonly hasActiveTool = computed(() => this.state().activeToolId !== null);
  readonly error = computed(() => this.state().error);
  readonly theme = computed(() => this.state().theme);
  /**
   * The delay to hide the toolbar
   */
  readonly delay = computed(() => this.state().delay);
  readonly config = computed(() => this.state().config);
  /**
   * Indicates if the toolbar is enabled based on config.
   * When disabled, toolbar UI won't render and services won't return forced values.
   * @default true
   */
  readonly isEnabled = computed(() => this.state().config.enabled ?? true);

  // State updates
  setVisibility(isVisible: boolean): void {
    if (isVisible) {
      this.state.update((state) => ({
        ...state,
        isHidden: false,
      }));
    } else {
      if (this.activeToolId() === null) {
        setTimeout(() => {
          this.state.update((state) => ({
            ...state,
            isHidden: true,
          }));
        }, this.state().delay);
      }
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.state.update((state) => ({
      ...state,
      theme,
    }));
  }

  setActiveTool(toolId: string | null): void {
    this.state.update((state) => ({
      ...state,
      activeToolId: toolId,
    }));

    if (toolId === null) {
      this.setVisibility(false);
    } else {
      this.setVisibility(true);
    }
  }

  // Public actions
  toggleTool(toolId: string | null): void {
    const currentToolId = this.activeToolId();
    this.setActiveTool(currentToolId === toolId ? null : toolId);
  }

  toggleVisibility(): void {
    this.state.update((state) => ({
      ...state,
      isHidden: !state.isHidden,
    }));
  }

  setConfig(config: ToolbarConfig): void {
    this.state.update((state) => ({
      ...state,
      config,
    }));
  }
}
