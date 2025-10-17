import { Directive, ElementRef, input, afterNextRender, Injector } from '@angular/core';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

@Directive({
  selector: '[appPrismHighlight]',
  standalone: true
})
export class PrismHighlightDirective {
  language = input<string>('typescript');

  constructor(
    private el: ElementRef,
    private injector: Injector
  ) {
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
