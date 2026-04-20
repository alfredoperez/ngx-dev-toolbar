import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'ndt-confirm-dialog',
  standalone: true,
  template: `
    <dialog
      #dialog
      class="confirm-dialog"
      [class.confirm-dialog--danger]="danger()"
      (click)="onBackdropClick($event)"
      (close)="onDialogClose()"
    >
      <div class="confirm-dialog__content">
        <h2 class="confirm-dialog__title">{{ title() }}</h2>
        @if (message()) {
          <p class="confirm-dialog__message">{{ message() }}</p>
        }
        <div class="confirm-dialog__actions">
          <button
            type="button"
            class="confirm-dialog__btn confirm-dialog__btn--secondary"
            (click)="cancel()"
          >
            {{ cancelLabel() }}
          </button>
          <button
            type="button"
            class="confirm-dialog__btn"
            [class.confirm-dialog__btn--danger]="danger()"
            [class.confirm-dialog__btn--primary]="!danger()"
            (click)="confirm()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </dialog>
  `,
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarConfirmDialogComponent {
  title = input.required<string>();
  message = input<string>('');
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  danger = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private result: 'confirm' | 'cancel' | null = null;

  show(): void {
    this.result = null;
    this.dialogRef().nativeElement.showModal();
  }

  confirm(): void {
    this.result = 'confirm';
    this.dialogRef().nativeElement.close();
  }

  cancel(): void {
    this.result = 'cancel';
    this.dialogRef().nativeElement.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogRef().nativeElement) {
      this.cancel();
    }
  }

  protected onDialogClose(): void {
    if (this.result === 'confirm') {
      this.confirmed.emit();
    } else {
      this.cancelled.emit();
    }
  }
}
