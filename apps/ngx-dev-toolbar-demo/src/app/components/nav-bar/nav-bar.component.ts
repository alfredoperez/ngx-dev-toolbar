import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav-bar">
      <div class="nav-content">
        <a routerLink="/" class="nav-brand">Demo App</a>
        <div class="nav-links">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Home</a
          >
          <a routerLink="/feature-flags" routerLinkActive="active"
            >Feature Flags</a
          >
          <a routerLink="/languages" routerLinkActive="active">Languages</a>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .nav-bar {
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .nav-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .nav-brand {
        font-size: 1.25rem;
        font-weight: bold;
        text-decoration: none;
        color: #333;
      }

      .nav-links {
        display: flex;
        gap: 1.5rem;

        a {
          text-decoration: none;
          color: #666;
          transition: color 0.2s;

          &:hover,
          &.active {
            color: #2196f3;
          }
        }
      }
    `,
  ],
})
export class NavBarComponent {}
