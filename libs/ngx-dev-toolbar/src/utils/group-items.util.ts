/**
 * Minimum shape required by {@link groupItems}: each item needs a stable id,
 * a display name (used for sorting), and an optional group label.
 */
export interface Groupable {
  id: string;
  name: string;
  group?: string;
}

/**
 * Result of partitioning a list of items into pinned, named groups, and ungrouped.
 */
export interface GroupedItems<T extends Groupable> {
  /** Pinned items, alphabetically sorted. Always rendered first, regardless of group. */
  pinned: T[];
  /** Named groups, sorted alphabetically by group name; items inside each group sorted alphabetically by name. */
  groups: { name: string; items: T[] }[];
  /** Items without a group (and not pinned), sorted alphabetically. Rendered last. */
  ungrouped: T[];
}

/**
 * Partitions items into pinned + named groups + ungrouped sections, applying
 * the same alphabetical-name ordering used elsewhere in the toolbar.
 *
 * Backward-compatible: if no item has a `group`, `groups` is `[]` and the
 * result is equivalent to the legacy pinned-first flat list.
 *
 * Pure function — no side effects, returns a new object.
 */
export function groupItems<T extends Groupable>(
  items: T[],
  pinnedIds: Set<string>
): GroupedItems<T> {
  const byName = (a: T, b: T) => a.name.localeCompare(b.name);

  const pinned: T[] = [];
  const grouped = new Map<string, T[]>();
  const ungrouped: T[] = [];

  for (const item of items) {
    if (pinnedIds.has(item.id)) {
      pinned.push(item);
      continue;
    }
    if (item.group) {
      const bucket = grouped.get(item.group);
      if (bucket) {
        bucket.push(item);
      } else {
        grouped.set(item.group, [item]);
      }
    } else {
      ungrouped.push(item);
    }
  }

  pinned.sort(byName);
  ungrouped.sort(byName);

  const groups = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, list]) => ({ name, items: list.sort(byName) }));

  return { pinned, groups, ungrouped };
}
