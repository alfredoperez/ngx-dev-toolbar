import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Highlight } from 'ngx-highlightjs';
import { AnalyticsService } from '../../../shared/services/analytics.service';

interface Step {
  id: number;
  title: string;
  description: string;
  code: string;
}

@Component({
  selector: 'app-how-to-use-section',
  standalone: true,
  imports: [CommonModule, Highlight],
  templateUrl: './how-to-use-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInFromLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '600ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('codeSlideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class HowToUseSectionComponent {
  private readonly analytics = inject(AnalyticsService);
  activeStep = signal<number>(1);

  currentStepCode = computed(() => {
    const currentStep =
      this.steps.find((step) => step.id === this.activeStep()) || this.steps[0];
    return currentStep.code;
  });
  readonly steps: Step[] = [
    {
      id: 1,
      title: 'Initialize Toolbar',
      description: 'Add the Dev Toolbar to your main.ts with zero production bundle impact',
      code: `
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';

async function bootstrap() {
  const appRef = await bootstrapApplication(AppComponent, appConfig);

  // 👇👇 Initialize toolbar only in development 👇👇
  if (isDevMode()) {
    const { initToolbar } = await import('ngx-dev-toolbar');
    initToolbar(appRef);
  }
}

bootstrap();
        `,
    },
    {
      id: 2,
      title: 'Configure Flags',
      description:
        'Set available options of Dev Toolbar Feature Flags service, from the service where your application is managing the feature flags',
      code: `
      // 1. Get the flags from the service
      this.appFlagsService.flags$.pipe(

        // 2. Map the flags to the format expected by the toolbar
        map((flags) =>
          flags.map((flag) => ({
            id: flag.name,
            name: flag.name,
            description: flag.description,
            isEnabled: flag.enabled,
          }))
        ),

        // 3. 👇👇 Set the flags to the toolbar 👇👇
        tap((flags) =>
          this.devToolbarFlags.setAvailableOptions(flags)
        )
      )`,
    },
    {
      id: 3,
      title: 'Read Flag Values',
      description:
        'Get the forced values from the Dev Toolbar Feature Flags to find forced values of the flags',
      code: `
      flags$ = combineLatest([
        // 1. Get the flags from the application
        this.appFlagsService.flags$,

        // 2. 👇👇 Get the forced values from the toolbar 👇👇
        this.devToolbarFlags.getForcedValues()
      ]).pipe(

        // 3. Map the flags to the format expected by the application
        map(([flags, forcedFlags]) => {
          const flag = flags.find(
              (f) => f.name === flagName);
          const forcedFlag = forcedFlags.find(
               (f) => f.id === flagName);

          return forcedFlag?.isForced
              ? forcedFlag?.isEnabled
               : flag?.enabled;
        })
      )`,
    },
  ];

  onToggleStep(stepId: number): void {
    this.activeStep.set(stepId);
    this.analytics.trackEvent('step_toggle', {
      category: 'engagement',
      action: stepId,
    });
  }

  isStepActive(stepId: number): boolean {
    return this.activeStep() === stepId;
  }
}
