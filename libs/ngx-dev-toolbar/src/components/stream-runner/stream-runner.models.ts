/**
 * A single step in a streaming generation. Each step creates `total` items by
 * calling `runItem` once per index. Per-item timing and randomness live in
 * the consumer's `runItem` (await delays, throw to simulate failures).
 */
export interface StreamStep<T = unknown> {
  /** Plural noun for the items (e.g. "customers", "invoices"). */
  label: string;
  /** Active verb shown during running (e.g. "Creating"). Default "Creating". */
  verbActive?: string;
  /** Past verb shown when done (e.g. "Created"). Default "Created". */
  verbDone?: string;
  /** Optional badge label (e.g. "USER") shown next to each generated item. */
  badge?: string;
  /** Number of items to create in this step. Required — drives the per-item loop. */
  total: number;
  /**
   * Sub-description shown below the step header (e.g. "Active accounts
   * with valid payment methods"). Optional.
   */
  description?: string;
  /** Creates one item. Owns its own timing (await + random delay) and may throw. */
  runItem: (index: number) => Promise<T>;
  /** Optional deeplink builder. The URL is embedded in the item's title. */
  link?: (item: T) => string;
  /** Optional title builder for each item (defaults to "<singular> <index+1>"). */
  describe?: (item: T) => string;
  /**
   * Optional sub-description shown below the title once the item is done
   * (e.g. metadata, status note, summary).
   */
  detail?: (item: T) => string;
  /**
   * Sub-description shown below the title while the item is being created.
   * Defaults to "Working…".
   */
  placeholderDetail?: string;
}

export type StreamStepStatus = 'queued' | 'running' | 'done' | 'error';
export type StreamItemStatus = 'queued' | 'running' | 'done' | 'error';

export interface StreamItemRecord {
  index: number;
  status: StreamItemStatus;
  value?: unknown;
  /** Title (resolved from describe(value) when done). */
  label?: string;
  /** Sub-description (resolved from detail(value) when done). */
  detail?: string;
  /** Deeplink URL (resolved from link(value) when done). */
  href?: string;
  /** Error message when status === 'error'. */
  error?: string;
}

export interface StreamStepRecord {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  step: StreamStep<any>;
  status: StreamStepStatus;
  items: StreamItemRecord[];
  expanded: boolean;
  doneCount: number;
  errorCount: number;
  /** Step-level error if everything failed. */
  error?: string;
}

export interface StreamPacing {
  /** Stagger between sequential step reveals. Default 60. */
  stagger?: number;
  /** Pause after a step completes before the next starts. Default 200. */
  stepGap?: number;
}

export interface StreamRunOptions {
  /** Top-line title (e.g. "Generating billing data"). */
  title: string;
  /** Optional one-line preamble shown under the title. */
  preamble?: string;
  /**
   * Steps to run, in order.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: StreamStep<any>[];
  /** Pacing overrides. */
  pacing?: StreamPacing;
}

export interface StreamRunResult {
  totalItems: number;
  totalSteps: number;
  errorCount: number;
  durationMs: number;
}
