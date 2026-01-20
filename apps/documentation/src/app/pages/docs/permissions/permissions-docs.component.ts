import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { CodeExample } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-permissions-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeExampleComponent],
  templateUrl: './permissions-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsDocsComponent {
  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject, signal } from '@angular/core';
import { ToolbarPermissionsService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: \`
    @if (canEdit()) {
      <button>Edit</button>
    }
    @if (canDelete()) {
      <button>Delete</button>
    }
  \`
})
export class AppComponent {
  private permissionsService = inject(ToolbarPermissionsService);

  canEdit = signal(false);
  canDelete = signal(false);

  ngOnInit() {
    // Define available permissions
    this.permissionsService.setAvailableOptions([
      {
        id: 'can-edit',
        name: 'Can Edit',
        description: 'Permission to edit records',
        isGranted: false,
        isForced: false
      },
      {
        id: 'can-delete',
        name: 'Can Delete',
        description: 'Permission to delete records',
        isGranted: false,
        isForced: false
      }
    ]);

    // Subscribe to forced permission values
    this.permissionsService.getForcedValues().subscribe(permissions => {
      const edit = permissions.find(p => p.id === 'can-edit');
      const del = permissions.find(p => p.id === 'can-delete');

      this.canEdit.set(edit?.isGranted || false);
      this.canDelete.set(del?.isGranted || false);
    });
  }
}
    `.trim(),
    description: 'Basic setup for Permissions Tool - define permissions and handle changes',
    showLineNumbers: true
  };
}
