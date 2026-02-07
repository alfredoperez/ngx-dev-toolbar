import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { ToolbarButtonComponent } from '../button/button.component';
import { ToolbarStepDirective } from './step-view.directive';

@Component({
  selector: 'ngt-step-view',
  standalone: true,
  imports: [NgTemplateOutlet, ToolbarButtonComponent],
  template: `
    @if (!isDefaultStep()) {
      <div class="step-header">
        <ngt-button (click)="back.emit()" ariaLabel="Back">\u2190 Back</ngt-button>
        @if (activeTitle()) {
          <span class="step-title">{{ activeTitle() }}</span>
        }
      </div>
    }

    @if (activeTemplate(); as tmpl) {
      <ng-container [ngTemplateOutlet]="tmpl" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: var(--ngt-spacing-sm);
      padding-bottom: var(--ngt-spacing-sm);
      margin-bottom: var(--ngt-spacing-sm);
      border-bottom: 1px solid var(--ngt-border-primary);
    }

    .step-title {
      font-size: var(--ngt-font-size-md);
      font-weight: 600;
      color: var(--ngt-text-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarStepViewComponent {
  readonly currentStep = input.required<string>();
  readonly defaultStep = input<string>('list');

  readonly back = output<void>();

  readonly steps = contentChildren(ToolbarStepDirective);

  readonly isDefaultStep = computed(
    () => this.currentStep() === this.defaultStep()
  );

  readonly activeStep = computed(() =>
    this.steps().find((s) => s.ngtStep() === this.currentStep())
  );

  readonly activeTitle = computed(() => this.activeStep()?.stepTitle() ?? '');

  readonly activeTemplate = computed(
    () => this.activeStep()?.templateRef ?? null
  );
}
