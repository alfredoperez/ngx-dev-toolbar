import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="home-container"></div> `,
  styles: [
    `
      .home-container {
        padding: 2rem;
        max-width: 800px;
        height: 100vh;
        margin: 0 auto;
      }
    `,
  ],
})
export class HomeComponent {}
