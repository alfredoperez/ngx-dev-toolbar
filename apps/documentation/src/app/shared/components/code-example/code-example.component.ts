import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrismHighlightDirective } from '../../directives/prism-highlight.directive';
import { CodeCopyService } from '../../services/code-copy.service';
import { CodeExample } from '../../models/documentation.models';

@Component({
  selector: 'app-code-example',
  standalone: true,
  imports: [CommonModule, PrismHighlightDirective],
  templateUrl: './code-example.component.html',
  styleUrls: ['./code-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeExampleComponent {
  example = input.required<CodeExample>();

  copied = signal(false);
  private codeCopyService = inject(CodeCopyService);

  async onCopy() {
    const code = this.example().code.trim();
    const success = await this.codeCopyService.copyToClipboard(code);

    if (success) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
