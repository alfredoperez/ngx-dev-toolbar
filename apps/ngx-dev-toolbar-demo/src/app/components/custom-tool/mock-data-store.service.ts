/**
 * Demo app's in-memory mirror of mock entities created by the toolbar's mock-data tool.
 * Lives only in the demo application — not part of the ngx-dev-toolbar library.
 */
import { Injectable, Signal, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MockDataStoreService {
  private readonly state = signal<Map<string, unknown[]>>(new Map());

  /**
   * Append a batch of items to the array stored under `label`.
   * Performs an immutable update: the previous array reference is not mutated.
   */
  addBatch(label: string, items: readonly unknown[]): void {
    this.state.update((current) => {
      const next = new Map(current);
      const previous = current.get(label) ?? [];
      next.set(label, [...previous, ...items]);
      return next;
    });
  }

  /**
   * Synchronously read the current array for `label`, or an empty array if absent.
   */
  entities<T>(label: string): readonly T[] {
    return (this.state().get(label) ?? []) as readonly T[];
  }

  /**
   * Returns a computed signal that derives the array slice for `label` from the inner map.
   */
  entitiesSignal<T>(label: string): Signal<readonly T[]> {
    return computed(() => (this.state().get(label) ?? []) as readonly T[]);
  }

  /**
   * Remove a single label from the store, or clear all entries when `label` is omitted.
   * Always replaces the inner map immutably.
   */
  clear(label?: string): void {
    if (label === undefined) {
      this.state.set(new Map());
      return;
    }

    this.state.update((current) => {
      if (!current.has(label)) {
        return current;
      }
      const next = new Map(current);
      next.delete(label);
      return next;
    });
  }
}
