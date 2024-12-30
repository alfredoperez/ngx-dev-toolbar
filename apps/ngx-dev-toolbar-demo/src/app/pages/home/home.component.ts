import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="container">
      <h1>NGX Dev Toolbar Demo App</h1>

      <section class="features">
        <h2>Features</h2>
        <ul>
          <li>Customizable development toolbar for Angular applications</li>
          <li>Easy integration with existing projects</li>
          <li>Extensible tool system</li>
          <li>Responsive and accessible design</li>
        </ul>
      </section>

      <section class="getting-started">
        <h2>Getting Started</h2>
        <pre><code>npm install ngx-dev-toolbar</code></pre>
      </section>
    </main>
  `,
  styles: [
    `
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      h1 {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
      }

      section {
        margin-bottom: 2rem;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      ul {
        list-style-type: disc;
        padding-left: 1.5rem;
      }

      li {
        margin-bottom: 0.5rem;
      }

      pre {
        background-color: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
      }
    `,
  ],
})
export class HomeComponent {}
