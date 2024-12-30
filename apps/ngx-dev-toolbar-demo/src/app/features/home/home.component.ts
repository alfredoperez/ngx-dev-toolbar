import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h1>Welcome to the Demo Application</h1>
      <p>This is a demo application showcasing feature flags implementation.</p>
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }
    `,
  ],
})
export class HomeComponent {}
