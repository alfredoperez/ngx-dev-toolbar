import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { ApiReferenceComponent } from '../../../shared/components/api-reference/api-reference.component';
import { CodeExample, ApiMethod } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-permissions-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeExampleComponent, ApiReferenceComponent],
  templateUrl: './permissions-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsDocsComponent {
  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject, signal } from '@angular/core';
import { DevToolbarPermissionsService } from 'ngx-dev-toolbar';

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
  private permissionsService = inject(DevToolbarPermissionsService);

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

  apiMethods: ApiMethod[] = [
    {
      name: 'setAvailableOptions',
      signature: 'setAvailableOptions(permissions: DevToolbarPermission[]): void',
      description: 'Defines the available permissions that can be overridden in the toolbar.',
      parameters: [
        {
          name: 'permissions',
          type: 'DevToolbarPermission[]',
          description: 'Array of permission definitions'
        }
      ],
      returnType: {
        type: 'void',
        description: 'No return value'
      }
    },
    {
      name: 'getForcedValues',
      signature: 'getForcedValues(): Observable<DevToolbarPermission[]>',
      description: 'Gets an observable of permissions that have been overridden through the toolbar.',
      parameters: [],
      returnType: {
        type: 'Observable<DevToolbarPermission[]>',
        description: 'Observable emitting forced permission changes'
      }
    }
  ];
}
