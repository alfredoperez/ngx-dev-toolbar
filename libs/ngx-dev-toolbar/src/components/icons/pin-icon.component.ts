import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ndt-pin-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.fill]="fill()"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        d="M14 12.41V5h1V4H8v1h1v7.41l-2 2V15h9v-.59l-2-2"
        opacity="0.2"
      ></path>
      <path
        d="M17 14v2h-5v4.5l-.5 1.5l-.5-1.5V16H6v-2l2-2V6H7V3h9v3h-1v6l2 2Z"
      ></path>
    </svg>
  `,
})
export class PinIconComponent {
  fill = input<string>('#FFFF');
}
