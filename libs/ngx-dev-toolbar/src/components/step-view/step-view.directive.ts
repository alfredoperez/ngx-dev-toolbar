import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: '[ndtStep]',
  standalone: true,
})
export class ToolbarStepDirective {
  readonly ndtStep = input.required<string>();
  readonly stepTitle = input<string>('');
  readonly templateRef = inject(TemplateRef);
}
