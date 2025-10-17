import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CodeCopyService {
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }
}
