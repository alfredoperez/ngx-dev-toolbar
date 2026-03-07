import { Injectable, computed, inject, signal } from '@angular/core';
import { ToolbarConfig } from './models/toolbar-config.interface';
import { ToolbarPosition } from './models/toolbar-position.model';
import { ToolbarStorageService } from './utils/storage.service';

interface ToolbarState {
  isHidden: boolean;
  isCompletelyHidden: boolean;
  position: ToolbarPosition;
  activeToolId: string | null;
  error: string | null;
  theme: 'light' | 'dark';
  delay: number;
  config: ToolbarConfig;
}

const SETTINGS_KEY = 'settings';

@Injectable({
  providedIn: 'root',
})
export class ToolbarStateService {
  private storageService = inject(ToolbarStorageService);

  // Initial state
  private state = signal<ToolbarState>({
    isHidden: true,
    isCompletelyHidden: false,
    position: 'bottom',
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
  readonly delay = computed(() => this.state().delay);
  readonly config = computed(() => this.state().config);
  readonly isEnabled = computed(() => this.state().config.enabled ?? true);
  readonly position = computed(() => this.state().position);
  readonly isCompletelyHidden = computed(
    () => this.state().isCompletelyHidden
  );

  constructor() {
    this.loadPersistedState();
  }

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
    // If config specifies a position, it takes priority
    if (config.position) {
      this.setPosition(config.position);
    }
  }

  setPosition(position: ToolbarPosition): void {
    // Close any active tool so its overlay doesn't stay in the old position
    this.setActiveTool(null);
    this.state.update((state) => ({
      ...state,
      position,
    }));
    this.persistState();
  }

  toggleCompletelyHidden(): void {
    this.state.update((state) => ({
      ...state,
      isCompletelyHidden: !state.isCompletelyHidden,
    }));
    this.persistState();
  }

  private loadPersistedState(): void {
    try {
      const stored = this.storageService.get<{
        position?: ToolbarPosition;
        isCompletelyHidden?: boolean;
      }>(SETTINGS_KEY);
      if (stored) {
        this.state.update((state) => ({
          ...state,
          position: stored.position ?? state.position,
          isCompletelyHidden: stored.isCompletelyHidden ?? state.isCompletelyHidden,
        }));
      }
    } catch {
      // Corrupted localStorage data — use defaults
    }
  }

  private persistState(): void {
    const current = this.storageService.get<Record<string, unknown>>(SETTINGS_KEY) ?? {};
    this.storageService.set(SETTINGS_KEY, {
      ...current,
      position: this.state().position,
      isCompletelyHidden: this.state().isCompletelyHidden,
    });
  }
}
