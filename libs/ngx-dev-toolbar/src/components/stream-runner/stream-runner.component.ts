import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { nounSingular, wait } from '../../utils/timing.util';
import {
  StreamItemRecord,
  StreamPacing,
  StreamRunOptions,
  StreamRunResult,
  StreamStepRecord,
} from './stream-runner.models';

const DEFAULT_PACING: Required<StreamPacing> = {
  stagger: 60,
  stepGap: 200,
};

const DEFAULT_VERB_ACTIVE = 'Creating';
const DEFAULT_VERB_DONE = 'Created';
const ITEM_RENDER_WINDOW = 6; // show last 6 items in the running step + currently active

@Component({
  selector: 'ndt-stream-runner',
  standalone: true,
  template: `
    @if (isIdle()) {
      <div class="ndt-stream__empty">
        <ng-content></ng-content>
      </div>
    } @else {
      <div class="ndt-stream" role="log" aria-live="polite">
        <div class="ndt-stream__header">
          <span class="ndt-stream__glyph ndt-stream__glyph--sparkle" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path d="M8 1.5l1.4 3.6L13 6.5l-3.6 1.4L8 11.5 6.6 7.9 3 6.5l3.6-1.4L8 1.5z M12 10l.6 1.6L14 12.2l-1.4.6L12 14.4l-.6-1.6L10 12.2l1.4-.6L12 10z" fill="currentColor"/>
            </svg>
          </span>
          <div class="ndt-stream__header-text">
            <h3 class="ndt-stream__title">{{ title() }}</h3>
            @if (preamble()) {
              <p class="ndt-stream__preamble">{{ preamble() }}</p>
            }
          </div>
        </div>

        <ol class="ndt-stream__steps">
          @for (record of visibleRecords(); track record.index) {
            <li
              class="ndt-stream__step"
              [class.ndt-stream__step--queued]="record.status === 'queued'"
              [class.ndt-stream__step--running]="record.status === 'running'"
              [class.ndt-stream__step--done]="record.status === 'done'"
              [class.ndt-stream__step--error]="record.status === 'error'"
              [class.ndt-stream__step--expanded]="record.expanded"
            >
              <div class="ndt-stream__step-row">
                <span class="ndt-stream__glyph" aria-hidden="true">
                  @switch (record.status) {
                    @case ('queued') {
                      <svg viewBox="0 0 16 16" width="14" height="14">
                        <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                      </svg>
                    }
                    @case ('running') {
                      <svg viewBox="0 0 16 16" width="14" height="14" class="ndt-stream__pulse">
                        <circle cx="8" cy="8" r="6" fill="currentColor"/>
                        <path d="M8 2a6 6 0 0 1 0 12" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('done') {
                      <svg viewBox="0 0 16 16" width="14" height="14">
                        <circle cx="8" cy="8" r="6" fill="currentColor"/>
                        <path d="M5 8.2 7 10.2 11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                      </svg>
                    }
                    @case ('error') {
                      <svg viewBox="0 0 16 16" width="14" height="14">
                        <circle cx="8" cy="8" r="6" fill="currentColor"/>
                        <path d="M6 6 10 10 M10 6 6 10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    }
                  }
                </span>

                <button
                  type="button"
                  class="ndt-stream__label-btn"
                  [disabled]="record.status === 'queued' || record.status === 'running'"
                  [attr.aria-expanded]="(record.status === 'done' || record.status === 'error') ? record.expanded : null"
                  (click)="toggleExpanded(record)"
                >
                  <span class="ndt-stream__verb">{{ stepVerb(record) }}</span>
                  <span class="ndt-stream__noun">{{ stepNoun(record) }}</span>
                  @if (canExpand(record)) {
                    <span
                      class="ndt-stream__chevron"
                      [class.ndt-stream__chevron--open]="record.expanded"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 12 12" width="10" height="10">
                        <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  }
                </button>
              </div>

              @if (record.step.description) {
                <p class="ndt-stream__step-description">{{ record.step.description }}</p>
              }

              @if (shouldShowItems(record)) {
                <ul class="ndt-stream__items">
                  @for (item of visibleItems(record); track item.index) {
                    <li
                      class="ndt-stream__item"
                      [class.ndt-stream__item--running]="item.status === 'running'"
                      [class.ndt-stream__item--done]="item.status === 'done'"
                      [class.ndt-stream__item--error]="item.status === 'error'"
                    >
                      <span class="ndt-stream__item-glyph" aria-hidden="true">
                        @switch (item.status) {
                          @case ('running') {
                            <svg viewBox="0 0 12 12" width="11" height="11" class="ndt-stream__spinner">
                              <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"/>
                              <path d="M6 2 a4 4 0 0 1 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                          }
                          @case ('done') {
                            <svg viewBox="0 0 12 12" width="11" height="11">
                              <path d="M2.5 6 5 8.3 9.5 3.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          }
                          @case ('error') {
                            <svg viewBox="0 0 12 12" width="11" height="11">
                              <path d="M3 3 9 9 M9 3 3 9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                            </svg>
                          }
                        }
                      </span>

                      <div class="ndt-stream__item-content">
                        @if (item.href && item.status === 'done') {
                          <a class="ndt-stream__item-title" [href]="item.href">
                            <span class="ndt-stream__item-verb">{{ itemVerb(record, item) }}</span>
                            <span class="ndt-stream__item-name">{{ itemName(record, item) }}</span>
                            <span class="ndt-stream__item-arrow" aria-hidden="true">→</span>
                          </a>
                        } @else {
                          <span
                            class="ndt-stream__item-title"
                            [class.ndt-stream__item-title--dim]="item.status === 'queued'"
                          >
                            <span class="ndt-stream__item-verb">{{ itemVerb(record, item) }}</span>
                            <span class="ndt-stream__item-name">{{ itemName(record, item) }}</span>
                          </span>
                        }

                        @if (itemDetail(record, item); as detail) {
                          <span
                            class="ndt-stream__item-detail"
                            [class.ndt-stream__item-detail--error]="item.status === 'error'"
                          >
                            {{ detail }}
                          </span>
                        }
                      </div>
                    </li>
                  }
                  @if (hiddenItemCount(record) > 0) {
                    <li class="ndt-stream__more">… {{ hiddenItemCount(record) }} earlier</li>
                  }
                </ul>
              }
            </li>
          }
        </ol>

        @if (summary()) {
          <p class="ndt-stream__summary">{{ summary() }}</p>
        }

        <div #anchor class="ndt-stream__anchor" aria-hidden="true"></div>
      </div>
    }
  `,
  styleUrls: ['./stream-runner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarStreamRunnerComponent {
  @ViewChild('anchor') private anchor?: ElementRef<HTMLElement>;

  readonly done = output<StreamRunResult>();
  readonly errored = output<{ stepIndex: number; itemIndex: number; error: string }>();

  private readonly _records = signal<StreamStepRecord[]>([]);
  private readonly _visibleCount = signal(0);
  private readonly _title = signal('');
  private readonly _preamble = signal<string | undefined>(undefined);
  private readonly _summary = signal<string | undefined>(undefined);
  private readonly _isRunning = signal(false);
  private readonly _hasRun = signal(false);
  private readonly _cancelled = signal(false);

  protected readonly title = this._title.asReadonly();
  protected readonly preamble = this._preamble.asReadonly();
  protected readonly summary = this._summary.asReadonly();
  protected readonly isIdle = computed(() => !this._hasRun() && !this._isRunning());
  readonly isRunning = this._isRunning.asReadonly();

  protected readonly visibleRecords = computed(() =>
    this._records().slice(0, this._visibleCount()),
  );

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  }

  /** Imperative entry point: kicks off a streaming run. */
  async start(options: StreamRunOptions): Promise<StreamRunResult> {
    if (this._isRunning()) {
      throw new Error('A run is already in progress');
    }

    const { title, preamble, steps } = options;
    const pacing: Required<StreamPacing> = { ...DEFAULT_PACING, ...options.pacing };
    const reduceMotion = this.prefersReducedMotion();

    this._cancelled.set(false);
    this._title.set(title);
    this._preamble.set(preamble);
    this._summary.set(undefined);
    this._isRunning.set(true);
    this._hasRun.set(true);

    const records: StreamStepRecord[] = steps.map((step, index) => ({
      index,
      step,
      status: 'queued' as const,
      items: Array.from({ length: step.total }, (_, i) => ({
        index: i,
        status: 'queued' as const,
      })),
      expanded: false,
      doneCount: 0,
      errorCount: 0,
    }));
    this._records.set(records);
    // All steps visible immediately. Per-step entry stagger is done in CSS
    // (animation-delay on nth-child) so it doesn't block the first runItem.
    this._visibleCount.set(records.length);

    const startedAt = performance.now();
    let totalItems = 0;
    let totalErrors = 0;

    for (let stepIndex = 0; stepIndex < records.length; stepIndex++) {
      if (this.isCancelled()) break;
      this.updateRecord(stepIndex, { status: 'running' });
      this.scrollToActive();

      const step = records[stepIndex].step;

      for (let itemIndex = 0; itemIndex < step.total; itemIndex++) {
        if (this.isCancelled()) break;
        this.updateItem(stepIndex, itemIndex, { status: 'running' });

        try {
          const value = await step.runItem(itemIndex);
          this.updateItem(stepIndex, itemIndex, {
            status: 'done',
            value,
            label: step.describe?.(value) ?? `${nounSingular(step.label)} ${itemIndex + 1}`,
            detail: step.detail?.(value),
            href: step.link?.(value),
          });
          totalItems++;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          this.updateItem(stepIndex, itemIndex, { status: 'error', error: message });
          totalErrors++;
          this.errored.emit({ stepIndex, itemIndex, error: message });
        }
      }

      // Step-level status: error only if everything failed; otherwise done.
      const finalRecord = this._records()[stepIndex];
      const allFailed = finalRecord.errorCount === finalRecord.items.length;
      this.updateRecord(stepIndex, {
        status: allFailed ? 'error' : 'done',
        error: allFailed ? `Failed to create any ${step.label.toLowerCase()}` : undefined,
      });

      if (!reduceMotion && stepIndex < records.length - 1) {
        await wait(pacing.stepGap);
      }
    }

    // If cancelled mid-run, skip the summary + done event entirely.
    if (this.isCancelled()) {
      this._isRunning.set(false);
      return { totalItems, totalSteps: records.length, errorCount: totalErrors, durationMs: 0 };
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const result: StreamRunResult = {
      totalItems,
      totalSteps: records.length,
      errorCount: totalErrors,
      durationMs,
    };

    const errorSuffix = totalErrors > 0 ? ` (${totalErrors} failed)` : '';
    this._summary.set(
      `Generated ${totalItems} ${totalItems === 1 ? 'entity' : 'entities'} across ${records.length} ${records.length === 1 ? 'type' : 'types'} in ${(durationMs / 1000).toFixed(2)}s${errorSuffix}.`,
    );
    this._isRunning.set(false);
    this.done.emit(result);
    return result;
  }

  /** Reset to the empty/idle state. Also cancels any in-flight run. */
  reset(): void {
    this._cancelled.set(true);
    this._records.set([]);
    this._visibleCount.set(0);
    this._title.set('');
    this._preamble.set(undefined);
    this._summary.set(undefined);
    this._hasRun.set(false);
  }

  private isCancelled(): boolean {
    return this._cancelled();
  }

  protected toggleExpanded(record: StreamStepRecord): void {
    if (record.status !== 'done' && record.status !== 'error') return;
    this.updateRecord(record.index, { expanded: !record.expanded });
  }

  protected canExpand(record: StreamStepRecord): boolean {
    return (record.status === 'done' || record.status === 'error')
      && record.items.some((it) => it.status !== 'queued');
  }

  protected stepVerb(record: StreamStepRecord): string {
    const active = record.step.verbActive ?? DEFAULT_VERB_ACTIVE;
    const past = record.step.verbDone ?? DEFAULT_VERB_DONE;
    if (record.status === 'queued') return '';
    if (record.status === 'running') return active;
    if (record.status === 'error') return `Failed`;
    return past;
  }

  protected stepNoun(record: StreamStepRecord): string {
    const lower = record.step.label.toLowerCase();
    const total = record.step.total;
    const { doneCount, errorCount } = record;

    if (record.status === 'queued') {
      return `${total} ${lower}`;
    }
    if (record.status === 'running') {
      const inFlight = doneCount + errorCount;
      return inFlight > 0
        ? `${inFlight} of ${total} ${lower}`
        : `${total} ${lower}…`;
    }
    if (record.status === 'error') {
      return `to create ${total} ${lower}`;
    }
    if (errorCount > 0) {
      return `${doneCount} of ${total} ${lower} (${errorCount} failed)`;
    }
    return `${doneCount} ${lower}`;
  }

  protected itemVerb(record: StreamStepRecord, item: StreamItemRecord): string {
    const active = record.step.verbActive ?? DEFAULT_VERB_ACTIVE;
    const past = record.step.verbDone ?? DEFAULT_VERB_DONE;
    switch (item.status) {
      case 'running': return active;
      case 'done': return past;
      case 'error': return 'Failed';
      default: return active;
    }
  }

  protected itemName(record: StreamStepRecord, item: StreamItemRecord): string {
    if (item.label) return item.label;
    return `${nounSingular(record.step.label)} ${item.index + 1}`;
  }

  protected itemDetail(record: StreamStepRecord, item: StreamItemRecord): string | null {
    if (item.status === 'done') return item.detail ?? null;
    if (item.status === 'error') return item.error ?? 'Failed';
    if (item.status === 'running') return record.step.placeholderDetail ?? 'Working…';
    return null;
  }

  protected shouldShowItems(record: StreamStepRecord): boolean {
    if (record.status === 'queued') return false;
    if (record.status === 'running') return true;
    return record.expanded;
  }

  protected visibleItems(record: StreamStepRecord): StreamItemRecord[] {
    const nonQueued = record.items.filter((it) => it.status !== 'queued');
    if (record.status === 'running') {
      // Sliding window: show the most recent N items
      return nonQueued.slice(-ITEM_RENDER_WINDOW);
    }
    return nonQueued; // expanded final view shows all
  }

  protected hiddenItemCount(record: StreamStepRecord): number {
    if (record.status !== 'running') return 0;
    const nonQueued = record.items.filter((it) => it.status !== 'queued').length;
    return Math.max(0, nonQueued - ITEM_RENDER_WINDOW);
  }

  private updateRecord(index: number, patch: Partial<StreamStepRecord>): void {
    this._records.update((records) =>
      records.map((r) => (r.index === index ? { ...r, ...patch } : r)),
    );
  }

  private updateItem(stepIndex: number, itemIndex: number, patch: Partial<StreamItemRecord>): void {
    this._records.update((records) =>
      records.map((r) => {
        if (r.index !== stepIndex) return r;
        const prev = r.items[itemIndex];
        const next = { ...prev, ...patch };
        const wasFinal = prev.status === 'done' || prev.status === 'error';
        const isDone = next.status === 'done' && !wasFinal;
        const isError = next.status === 'error' && !wasFinal;
        return {
          ...r,
          items: r.items.map((it) => (it.index === itemIndex ? next : it)),
          doneCount: r.doneCount + (isDone ? 1 : 0),
          errorCount: r.errorCount + (isError ? 1 : 0),
        };
      }),
    );
  }

  private scrollToActive(): void {
    if (this.prefersReducedMotion()) return;
    queueMicrotask(() => {
      this.anchor?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    });
  }
}

