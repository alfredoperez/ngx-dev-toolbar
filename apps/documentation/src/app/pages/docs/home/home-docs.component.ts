import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { CodeExample } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-home-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeExampleComponent],
  templateUrl: './home-docs.component.html',
  styleUrls: ['./home-docs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeDocsComponent {
  installExample: CodeExample = {
    language: 'bash',
    code: 'npm install ngx-dev-toolbar',
  };

  basicSetupExample: CodeExample = {
    language: 'typescript',
    fileName: 'main.ts',
    code: `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';

async function bootstrap() {
  const appRef = await bootstrapApplication(AppComponent, appConfig);

  // Initialize toolbar only in development
  if (isDevMode()) {
    const { initToolbar } = await import('ngx-dev-toolbar');
    initToolbar(appRef);
  }
}

bootstrap();`,
    showLineNumbers: true
  };

  configExample: CodeExample = {
    language: 'typescript',
    fileName: 'main.ts',
    code: `initToolbar(appRef, {
  config: {
    showFeatureFlagsTool: true,
    showPermissionsTool: true,
    showLanguageTool: true,
    showAppFeaturesTool: true,
    showPresetsTool: true,
  }
});`,
    showLineNumbers: true
  };
}
