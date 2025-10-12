import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ndt-filter-icon',
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
        d="M227.81,66.76l-.08.09L160,139.17v55.49A8,8,0,0,1,156.94,201l-32,21.33A8,8,0,0,1,112,216V139.17L44.27,66.85l-.08-.09A16,16,0,0,1,56,40H200a16,16,0,0,1,11.84,26.76Z"
        opacity="0.2"
      ></path>
      <path
        d="M230.6,49.53A23.94,23.94,0,0,0,200,32H56A24,24,0,0,0,38.15,65.67L104,139.37V216a8,8,0,0,0,11.58,7.16l32-16A8,8,0,0,0,152,200V139.37l65.85-73.7A23.93,23.93,0,0,0,230.6,49.53ZM203.36,54.86a8,8,0,0,1,.07,9.12L136,139.17V196.58l-16,8V139.17L52.57,64A8,8,0,0,1,56,48H200A8,8,0,0,1,203.36,54.86Z"
      ></path>
    </svg>
  `,
})
export class FilterIconComponent {
  fill = input<string>('#FFFF');
}
