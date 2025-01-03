import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import {
  DevToolbarComponent,
  DevToolbarFeatureFlagService,
  DevToolbarLanguageService,
  Flag,
} from 'ngx-dev-toolbar';
import { firstValueFrom, map } from 'rxjs';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FeatureFlagsService } from './services/feature-flags.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, DevToolbarComponent],
  template: `
    @if (useNewLayout() ) {
    <!-- New Modern Layout -->
    <div class="modern-layout">
      <app-nav-bar />
      <main class="modern-content">
        <router-outlet />
      </main>
    </div>
    } @else {
    <div class="original-layout">
      <app-nav-bar />
      <main class="content">
        <router-outlet />
      </main>
    </div>
    }
    <ndt-toolbar />
  `,
  styles: [
    `
      .modern-layout {
        min-height: 100vh;
        background: #f8f9fa;
      }
      .modern-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;

        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-top: 2rem;
      }

      .original-layout {
        .content {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private readonly languageToolbarService = inject(DevToolbarLanguageService);
  private readonly devToolbarFeatureFlagsService = inject(
    DevToolbarFeatureFlagService
  );
  private readonly featureFlagsService = inject(FeatureFlagsService);

  useNewLayout = toSignal(
    this.featureFlagsService.select('newDemoApplicationLayout')
  );

  ngOnInit(): void {
    this.loadFlags();
  }

  private async loadFlags(): Promise<void> {
    // Gets the flags from the application and sets them in the dev toolbar
    const flags: Flag[] = await firstValueFrom(
      this.featureFlagsService.flags$.pipe(
        map((flags) =>
          flags.map(
            (flag) =>
              ({
                id: flag.name,
                name: flag.name,
                description: flag.description,
                isEnabled: flag.enabled,
              } as Flag)
          )
        )
      )
    );
    this.devToolbarFeatureFlagsService.setAvailableOptions(flags);
  }

  constructor() {
    this.languageToolbarService.setAvailableOptions([
      { id: 'en', name: 'English' },
      { id: 'es', name: 'Spanish' },
    ]);
  }
}
