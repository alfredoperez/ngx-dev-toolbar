import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: '[ngtStep]',
  standalone: true,
})
export class ToolbarStepDirective {
  readonly ngtStep = input.required<string>();
  readonly stepTitle = input<string>('');
  readonly templateRef = inject(TemplateRef);
}
