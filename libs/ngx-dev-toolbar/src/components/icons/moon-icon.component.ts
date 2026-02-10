import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ndt-moon-icon',
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
        d="M224.3,150.3a8.1,8.1,0,0,0-7.8-5.7l-2.2.4A84,84,0,0,1,111,41.6a5.7,5.7,0,0,0,.3-1.8A7.9,7.9,0,0,0,109,33a8.1,8.1,0,0,0-8.1-1.1A104,104,0,1,0,225.4,156.9,8.1,8.1,0,0,0,224.3,150.3Z"
        opacity="0.2"
      />
      <path
        d="M233.5,137.3a12.1,12.1,0,0,0-11.8-8.6,7.9,7.9,0,0,0-1.3.1,80,80,0,0,1-98.2-98.2,12,12,0,0,0-15.6-14A104.2,104.2,0,0,0,32,120c0,57.4,46.6,104,104,104A104.2,104.2,0,0,0,239.4,149.6,12,12,0,0,0,233.5,137.3ZM136,208A88,88,0,0,1,48,120a87.6,87.6,0,0,1,64.8-84.7,96,96,0,0,0,111.9,112A87.6,87.6,0,0,1,136,208Z"
      />
    </svg>
  `,
})
export class MoonIconComponent {
  fill = input<string>('#FFFF');
}
