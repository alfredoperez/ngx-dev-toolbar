import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExampleComponent } from '../../../../shared/components/code-example/code-example.component';
import { CodeExample } from '../../../../shared/models/documentation.models';

@Component({
  selector: 'app-custom-tool-guide',
  standalone: true,
  imports: [CommonModule, CodeExampleComponent],
  templateUrl: './custom-tool-guide.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomToolGuideComponent {
  modelsExample: CodeExample = {
    language: 'typescript',
    fileName: 'notes.models.ts',
    code: `
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}
    `.trim(),
    description: 'Define the data model for your custom tool',
    showLineNumbers: true,
  };

  serviceExample: CodeExample = {
    language: 'typescript',
    fileName: 'notes-internal.service.ts',
    code: `
import { Injectable, signal } from '@angular/core';
import { Note } from './notes.models';

@Injectable({ providedIn: 'root' })
export class NotesInternalService {
  private readonly _notes = signal<Note[]>([]);
  readonly notes = this._notes.asReadonly();

  addNote(note: Note): void {
    this._notes.update(notes => [...notes, note]);
  }

  removeNote(id: string): void {
    this._notes.update(notes => notes.filter(n => n.id !== id));
  }

  updateNote(id: string, updates: Partial<Note>): void {
    this._notes.update(notes =>
      notes.map(n => n.id === id ? { ...n, ...updates } : n)
    );
  }
}
    `.trim(),
    description: 'Internal service managing tool state with Angular signals',
    showLineNumbers: true,
  };

  componentExample: CodeExample = {
    language: 'typescript',
    fileName: 'notes-tool.component.ts',
    code: `
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ToolbarToolComponent,
  ToolbarWindowOptions,
  ToolbarButtonComponent,
  ToolbarInputComponent,
  ToolbarListComponent,
  ToolbarListItemComponent,
} from 'ngx-dev-toolbar';
import { NotesInternalService } from './notes-internal.service';

@Component({
  selector: 'app-notes-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    ToolbarButtonComponent,
    ToolbarInputComponent,
    ToolbarListComponent,
    ToolbarListItemComponent,
  ],
  template: \`
    <ngt-toolbar-tool
      [options]="windowOptions"
      title="Notes"
      icon="edit"
    >
      <ngt-list
        [hasItems]="notesService.notes().length > 0"
        emptyMessage="No notes yet"
      >
        @for (note of notesService.notes(); track note.id) {
          <ngt-list-item [label]="note.title" />
        }
      </ngt-list>
    </ngt-toolbar-tool>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesToolComponent {
  protected readonly notesService = inject(NotesInternalService);

  readonly windowOptions: ToolbarWindowOptions = {
    id: 'notes',
    title: 'Notes',
    description: 'Quick notes for development',
    size: 'medium',
  };
}
    `.trim(),
    description: 'Tool component wrapping content in ToolbarToolComponent',
    showLineNumbers: true,
  };

  stepViewExample: CodeExample = {
    language: 'typescript',
    fileName: 'multi-step-tool.component.ts',
    code: `
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ToolbarToolComponent,
  ToolbarWindowOptions,
  ToolbarStepViewComponent,
  ToolbarStepDirective,
  ToolbarButtonComponent,
} from 'ngx-dev-toolbar';

@Component({
  selector: 'app-multi-step-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    ToolbarStepViewComponent,
    ToolbarStepDirective,
    ToolbarButtonComponent,
  ],
  template: \`
    <ngt-toolbar-tool [options]="windowOptions" title="Items" icon="star">
      <ngt-step-view
        [currentStep]="viewMode()"
        defaultStep="list"
        (back)="viewMode.set('list')"
      >
        <ng-template ngtStep="list" stepTitle="All Items">
          <p>Your list content here...</p>
          <ngt-button (click)="viewMode.set('create')">
            Create New
          </ngt-button>
        </ng-template>

        <ng-template ngtStep="create" stepTitle="Create Item">
          <p>Your create form here...</p>
        </ng-template>

        <ng-template ngtStep="edit" stepTitle="Edit Item">
          <p>Your edit form here...</p>
        </ng-template>
      </ngt-step-view>
    </ngt-toolbar-tool>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiStepToolComponent {
  viewMode = signal<'list' | 'create' | 'edit'>('list');

  readonly windowOptions: ToolbarWindowOptions = {
    id: 'items',
    title: 'Items',
    size: 'medium',
  };
}
    `.trim(),
    description:
      'Using ToolbarStepViewComponent for multi-step tool workflows',
    showLineNumbers: true,
  };

  stylingExample: CodeExample = {
    language: 'css',
    fileName: 'notes-tool.component.scss',
    code: `
/* Use design tokens for consistent styling */
.notes-container {
  display: flex;
  flex-direction: column;
  gap: var(--ngt-spacing-md);
  padding-top: var(--ngt-spacing-md);
}

.note-item {
  padding: var(--ngt-spacing-sm) var(--ngt-spacing-md);
  border-radius: var(--ngt-border-radius-medium);
  background: var(--ngt-background-secondary);
  color: var(--ngt-text-primary);
  border: 1px solid var(--ngt-border-primary);
}

.note-item__title {
  font-size: var(--ngt-font-size-md);
  font-weight: 600;
  color: var(--ngt-text-primary);
}

.note-item__content {
  font-size: var(--ngt-font-size-sm);
  color: var(--ngt-text-secondary);
  margin-top: var(--ngt-spacing-xs);
}
    `.trim(),
    description: 'Use design tokens and defensive CSS patterns for styling',
    showLineNumbers: true,
  };

  windowOptionsExample: CodeExample = {
    language: 'typescript',
    fileName: 'window-options.ts',
    code: `
const windowOptions: ToolbarWindowOptions = {
  id: 'my-tool',                // Unique tool identifier
  title: 'My Tool',             // Window title
  description: 'Tool info',     // Optional description shown in header
  isClosable: true,             // Show close button (default: true)
  placement: 'bottom-center',   // Window position relative to toolbar
  size: 'medium',               // 'small' | 'medium' | 'tall' | 'large'
  isBeta: false,                // Show beta badge
};

// Available placements:
// 'bottom-left' | 'bottom-center' | 'bottom-right'
// 'top-left'    | 'top-center'    | 'top-right'

// Available sizes:
// 'small'  - compact tools
// 'medium' - standard tools (default)
// 'tall'   - tools with long lists
// 'large'  - tools needing more space
    `.trim(),
    description: 'ToolbarWindowOptions configuration interface',
    showLineNumbers: true,
  };

  completeExample: CodeExample = {
    language: 'typescript',
    fileName: 'notes-tool-complete.component.ts',
    code: `
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { Injectable } from '@angular/core';
import {
  ToolbarToolComponent,
  ToolbarWindowOptions,
  ToolbarButtonComponent,
  ToolbarInputComponent,
  ToolbarListComponent,
  ToolbarListItemComponent,
  ToolbarStepViewComponent,
  ToolbarStepDirective,
} from 'ngx-dev-toolbar';

// --- Model ---
interface Note {
  id: string;
  title: string;
  content: string;
}

// --- Service ---
@Injectable({ providedIn: 'root' })
class NotesService {
  private readonly _notes = signal<Note[]>([]);
  readonly notes = this._notes.asReadonly();

  add(title: string, content: string): void {
    this._notes.update(notes => [
      ...notes,
      { id: crypto.randomUUID(), title, content }
    ]);
  }

  remove(id: string): void {
    this._notes.update(notes => notes.filter(n => n.id !== id));
  }
}

// --- Component ---
@Component({
  selector: 'app-notes-tool',
  standalone: true,
  imports: [
    ToolbarToolComponent,
    ToolbarButtonComponent,
    ToolbarInputComponent,
    ToolbarListComponent,
    ToolbarListItemComponent,
    ToolbarStepViewComponent,
    ToolbarStepDirective,
  ],
  template: \`
    <ngt-toolbar-tool [options]="windowOptions" title="Notes" icon="edit">
      <ngt-step-view
        [currentStep]="viewMode()"
        defaultStep="list"
        (back)="viewMode.set('list')"
      >
        <ng-template ngtStep="list" stepTitle="All Notes">
          <ngt-button (click)="viewMode.set('create')" icon="edit">
            Add Note
          </ngt-button>
          <ngt-list
            [hasItems]="notesService.notes().length > 0"
            emptyMessage="No notes yet"
            emptyHint="Click 'Add Note' to create one"
          >
            @for (note of notesService.notes(); track note.id) {
              <ngt-list-item [label]="note.title">
                <ngt-button
                  variant="icon"
                  icon="trash"
                  ariaLabel="Delete"
                  (click)="notesService.remove(note.id)"
                />
              </ngt-list-item>
            }
          </ngt-list>
        </ng-template>

        <ng-template ngtStep="create" stepTitle="New Note">
          <div class="form">
            <ngt-input
              [(value)]="newTitle"
              placeholder="Note title"
              ariaLabel="Note title"
            />
            <ngt-input
              [(value)]="newContent"
              placeholder="Note content"
              ariaLabel="Note content"
            />
            <ngt-button (click)="onCreate()" label="Save" />
          </div>
        </ng-template>
      </ngt-step-view>
    </ngt-toolbar-tool>
  \`,
  styles: \`
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--ngt-spacing-sm);
      padding-top: var(--ngt-spacing-sm);
    }
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesToolComponent {
  protected readonly notesService = inject(NotesService);
  viewMode = signal<'list' | 'create'>('list');
  newTitle = signal('');
  newContent = signal('');

  readonly windowOptions: ToolbarWindowOptions = {
    id: 'notes',
    title: 'Notes',
    description: 'Quick development notes',
    size: 'medium',
  };

  onCreate(): void {
    if (this.newTitle()) {
      this.notesService.add(this.newTitle(), this.newContent());
      this.newTitle.set('');
      this.newContent.set('');
      this.viewMode.set('list');
    }
  }
}
    `.trim(),
    description: 'Complete Notes Tool example with model, service, and component',
    showLineNumbers: true,
  };
}
