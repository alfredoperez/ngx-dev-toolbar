import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ndt-network-icon',
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
        d="M152,40V72a8,8,0,0,1-8,8H112a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h32A8,8,0,0,1,152,40ZM80,168H48a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H80a8,8,0,0,0,8-8V176A8,8,0,0,0,80,168Zm128,0H176a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8h32a8,8,0,0,0,8-8V176A8,8,0,0,0,208,168Z"
        opacity="0.2"
      ></path>
      <path
        d="M232,112H136V88h8a16,16,0,0,0,16-16V40a16,16,0,0,0-16-16H112A16,16,0,0,0,96,40V72a16,16,0,0,0,16,16h8v24H24a8,8,0,0,0,0,16H56v32H48a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16H80a16,16,0,0,0,16-16V176a16,16,0,0,0-16-16H72V128H184v32h-8a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16h32a16,16,0,0,0,16-16V176a16,16,0,0,0-16-16h-8V128h32a8,8,0,0,0,0-16ZM112,40h32V72H112ZM80,208H48V176H80Zm128,0H176V176h32Z"
      ></path>
    </svg>
  `,
})
export class NetworkIconComponent {
  fill = input<string>('#FFFF');
}
