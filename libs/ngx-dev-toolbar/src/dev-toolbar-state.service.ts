import { Injectable, computed, signal } from '@angular/core';

interface DevToolbarState {
  isHidden: boolean;
  activeToolId: string | null;
  error: string | null;
  theme: 'light' | 'dark';
  delay: number;
}

@Injectable({
  providedIn: 'root',
})
export class DevToolbarStateService {
  // Initial state
  private state = signal<DevToolbarState>({
    isHidden: true,
    activeToolId: null,
    delay: 3000,
    error: null,
    theme: 'dark',
  });

  // Selectors
  readonly isVisible = computed(() => !this.state().isHidden);
  readonly isDarkTheme = computed(() => this.state().theme === 'dark');
  readonly activeToolId = computed(() => this.state().activeToolId);
  readonly hasActiveTool = computed(() => this.state().activeToolId !== null);
  readonly error = computed(() => this.state().error);
  readonly theme = computed(() => this.state().theme);
  readonly delay = computed(() => this.state().delay);

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
}
