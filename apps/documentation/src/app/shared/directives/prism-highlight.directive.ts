import { Directive, ElementRef, input, afterNextRender, Injector, inject } from '@angular/core';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

@Directive({
  selector: '[appPrismHighlight]',
})
export class PrismHighlightDirective {
  private readonly el = inject(ElementRef);
  private readonly injector = inject(Injector);

  language = input<string>('typescript');

  constructor() {
    afterNextRender(() => this.highlight(), { injector: this.injector });
  }

  private highlight() {
    const lang = this.language();
    const grammar = Prism.languages[lang];

    if (grammar) {
      const code = this.el.nativeElement.textContent;
      this.el.nativeElement.innerHTML = Prism.highlight(code, grammar, lang);
    }
  }
}
