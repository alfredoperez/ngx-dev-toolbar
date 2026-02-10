import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ndt-sun-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.fill]="fill()"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 256 256"
    >
      <path
        d="M128,60a68,68,0,1,0,68,68A68.07,68.07,0,0,0,128,60Z"
        opacity="0.2"
      />
      <path
        d="M128,44a8,8,0,0,0,8-8V16a8,8,0,0,0-16,0V36A8,8,0,0,0,128,44ZM57.31,68.69a8,8,0,0,0,11.32-11.32L54.63,43.37A8,8,0,0,0,43.31,54.69ZM44,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H36A8,8,0,0,0,44,128Zm24.63,59.31-14,14a8,8,0,0,0,11.32,11.32l14-14a8,8,0,0,0-11.32-11.32ZM128,212a8,8,0,0,0-8,8v20a8,8,0,0,0,16,0V220A8,8,0,0,0,128,212Zm70.69-24.69a8,8,0,0,0-11.32,11.32l14,14a8,8,0,0,0,11.32-11.32ZM240,120H220a8,8,0,0,0,0,16h20a8,8,0,0,0,0-16Zm-24.69-62.63-14,14a8,8,0,0,0,11.32,11.32l14-14a8,8,0,0,0-11.32-11.32ZM128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Zm0,88a36,36,0,1,1,36-36A36,36,0,0,1,128,164Z"
      />
    </svg>
  `,
})
export class SunIconComponent {
  fill = input<string>('#FFFF');
}
