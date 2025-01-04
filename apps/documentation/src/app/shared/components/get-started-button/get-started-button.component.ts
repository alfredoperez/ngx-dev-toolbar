import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-get-started-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a
      [href]="href()"
      target="_blank"
      class="get-started-button rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 relative"
    >
      <div class="shine-container">
        <div class="shine-effect"></div>
      </div>
      <span class="relative z-10">
        {{ text() }} <i class="i-fa6-solid-arrow-right ms-2"></i>
      </span>
    </a>
  `,
  styles: [
    `
      .get-started-button {
        transition: all 0.3s ease;
        overflow: hidden;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);

          .shine-effect {
            animation: shine 1.5s infinite;
          }
        }
      }

      .shine-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
      }

      .shine-effect {
        position: absolute;
        top: 0;
        left: 0;
        width: 200%;
        height: 100%;
        background: linear-gradient(
          115deg,
          transparent,
          transparent 40%,
          rgba(255, 255, 255, 0.25) 40%,
          rgba(255, 255, 255, 0.25) 60%,
          transparent 60%
        );
        transform: translateX(-100%);
        animation: shine 3s infinite;
      }

      @keyframes shine {
        to {
          transform: translateX(50%);
        }
      }
    `,
  ],
})
export class GetStartedButtonComponent {
  text = input('Get Started');
  href = input('https://www.npmjs.com/package/ngx-dev-toolbar');
}
