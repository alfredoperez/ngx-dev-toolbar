import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ndt-angular-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient
          id="angular-gradient"
          x1="6"
          x2="18"
          y1="20"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#E40035" />
          <stop offset=".24" stop-color="#F60A48" />
          <stop offset=".352" stop-color="#F20755" />
          <stop offset=".494" stop-color="#DC087D" />
          <stop offset=".745" stop-color="#9717E7" />
          <stop offset="1" stop-color="#6C00F5" />
        </linearGradient>
      </defs>
      <g fill="url(#angular-gradient)">
        <polygon points="14.1,2.7 20.1,15.7 20.7,5.8" />
        <polygon points="15.6,16.4 8.4,16.4 7.4,18.6 12,21.2 16.6,18.6" />
        <polygon points="9.6,13.5 14.4,13.5 12,7.7" />
        <polygon points="9.9,2.7 3.3,5.8 3.9,15.7" />
      </g>
    </svg>
  `,
})
export class AngularIconComponent {}
