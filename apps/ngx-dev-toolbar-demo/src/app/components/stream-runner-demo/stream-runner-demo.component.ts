import {
  ChangeDetectionStrategy,
  Component,
  computed,
  viewChild,
} from '@angular/core';
import {
  StreamRunOptions,
  StreamStep,
  ToolbarButtonComponent,
  ToolbarStreamRunnerComponent,
  wait,
} from 'ngx-dev-toolbar';

// ─── Scenario data shapes ────────────────────────────────────────────────

interface Ticket {
  id: string;
  title: string;
}

interface Author {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  authorId: string;
}

interface Comment {
  id: string;
  text: string;
  postId: string;
}

@Component({
  selector: 'app-stream-runner-demo',
  standalone: true,
  imports: [ToolbarStreamRunnerComponent, ToolbarButtonComponent],
  template: `
    <section class="showcase">
      <div class="showcase-section">
        <h2>Stream Runner showcase</h2>
        <p>
          This page demonstrates the standalone
          <code>&lt;ndt-stream-runner&gt;</code> component with two scripted
          scenarios. It substitutes for a Storybook story until Storybook
          lands.
        </p>
        <div class="showcase-actions">
          <ndt-button (click)="runQuick()" [disabled]="isRunning()">
            Quick discovery (single-step)
          </ndt-button>
          <ndt-button (click)="runChained()" [disabled]="isRunning()">
            Multi-step generation (chaining)
          </ndt-button>
        </div>
      </div>

      <div class="showcase-section">
        <h3>Live runner</h3>
        <div class="showcase-runner">
          <ndt-stream-runner #runner>
            <p class="showcase-empty">Click a scenario above to start a run.</p>
          </ndt-stream-runner>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./stream-runner-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamRunnerDemoComponent {
  private readonly runner = viewChild<ToolbarStreamRunnerComponent>('runner');
  protected readonly isRunning = computed(() => this.runner()?.isRunning() ?? false);

  protected async runQuick(): Promise<void> {
    const step: StreamStep<Ticket> = {
      label: 'Tickets',
      verbActive: 'Reading',
      verbDone: 'Found',
      total: 5,
      runItem: async (i) => {
        await wait(150);
        return { id: `TICKET-${1000 + i}`, title: `Sample ticket ${i + 1}` };
      },
      describe: (t) => t.title,
      detail: (t) => `id ${t.id}`,
      placeholderDetail: 'Reading ticket…',
    };

    const options: StreamRunOptions = {
      title: 'Quick discovery',
      preamble: 'Streaming 5 sample tickets at ~150ms each.',
      steps: [step],
      pacing: { stepGap: 0 },
    };

    const runner = this.runner();
    if (!runner || runner.isRunning()) return;
    try {
      await runner.start(options);
    } catch (err) {
      console.error('Stream run failed:', err);
    }
  }

  protected async runChained(): Promise<void> {
    const authors: StreamStep<Author> = {
      label: 'Authors',
      total: 3,
      runItem: async (i) => {
        await wait(200);
        return { id: `author-${i + 1}`, name: `Author ${i + 1}` };
      },
      describe: (a) => a.name,
      detail: (a) => `id ${a.id}`,
    };

    const posts: StreamStep<Post> = {
      label: 'Posts',
      total: 5,
      runItem: async (i, ctx) => {
        const priorAuthors = ctx.prior('Authors') as readonly Author[];
        const author = priorAuthors[i % priorAuthors.length];
        await wait(180);
        return {
          id: `post-${i + 1}`,
          title: `Post ${i + 1}`,
          authorId: author.id,
        };
      },
      describe: (p) => p.title,
      detail: (p) => `by ${p.authorId}`,
    };

    const comments: StreamStep<Comment> = {
      label: 'Comments',
      total: 4,
      runItem: async (i, ctx) => {
        const priorPosts = ctx.prior('Posts') as readonly Post[];
        const post = priorPosts[i % priorPosts.length];
        await wait(160);
        return {
          id: `comment-${i + 1}`,
          text: `Comment ${i + 1}`,
          postId: post.id,
        };
      },
      describe: (c) => c.text,
      detail: (c) => `on ${c.postId}`,
    };

    const options: StreamRunOptions = {
      title: 'Multi-step generation',
      preamble:
        'Authors → posts that reference an author → comments that reference a post.',
      steps: [authors, posts, comments],
      pacing: { stepGap: 100 },
    };

    const runner = this.runner();
    if (!runner || runner.isRunning()) return;
    try {
      await runner.start(options);
    } catch (err) {
      console.error('Stream run failed:', err);
    }
  }
}
