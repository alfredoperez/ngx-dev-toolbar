import { groupItems, Groupable } from './group-items.util';

interface TestItem extends Groupable {
  id: string;
  name: string;
  group?: string;
}

const item = (id: string, name: string, group?: string): TestItem => ({
  id,
  name,
  group,
});

describe('groupItems', () => {
  describe('backward compatibility', () => {
    it('returns a flat ungrouped list when no item has a group', () => {
      const items: TestItem[] = [
        item('a', 'Charlie'),
        item('b', 'Alpha'),
        item('c', 'Bravo'),
      ];

      const result = groupItems(items, new Set());

      expect(result.pinned).toEqual([]);
      expect(result.groups).toEqual([]);
      expect(result.ungrouped.map((i) => i.name)).toEqual([
        'Alpha',
        'Bravo',
        'Charlie',
      ]);
    });

    it('returns empty arrays for empty input', () => {
      const result = groupItems([] as TestItem[], new Set());

      expect(result).toEqual({ pinned: [], groups: [], ungrouped: [] });
    });
  });

  describe('grouping', () => {
    it('partitions items into named groups', () => {
      const items: TestItem[] = [
        item('1', 'Login', 'Auth'),
        item('2', 'Cards', 'Payments'),
        item('3', 'Tokens', 'Auth'),
      ];

      const result = groupItems(items, new Set());

      expect(result.groups.map((g) => g.name)).toEqual(['Auth', 'Payments']);
      expect(result.groups[0].items.map((i) => i.name)).toEqual([
        'Login',
        'Tokens',
      ]);
      expect(result.groups[1].items.map((i) => i.name)).toEqual(['Cards']);
    });

    it('sorts groups alphabetically by name', () => {
      const items: TestItem[] = [
        item('1', 'X', 'Zebra'),
        item('2', 'Y', 'Alpha'),
        item('3', 'Z', 'Mango'),
      ];

      const result = groupItems(items, new Set());

      expect(result.groups.map((g) => g.name)).toEqual([
        'Alpha',
        'Mango',
        'Zebra',
      ]);
    });

    it('sorts items within a group alphabetically by name', () => {
      const items: TestItem[] = [
        item('1', 'Charlie', 'Group'),
        item('2', 'Alpha', 'Group'),
        item('3', 'Bravo', 'Group'),
      ];

      const result = groupItems(items, new Set());

      expect(result.groups[0].items.map((i) => i.name)).toEqual([
        'Alpha',
        'Bravo',
        'Charlie',
      ]);
    });

    it('places ungrouped items into the ungrouped bucket alongside grouped ones', () => {
      const items: TestItem[] = [
        item('1', 'Grouped', 'Auth'),
        item('2', 'Loose'),
      ];

      const result = groupItems(items, new Set());

      expect(result.groups).toHaveLength(1);
      expect(result.ungrouped.map((i) => i.name)).toEqual(['Loose']);
    });
  });

  describe('pinning', () => {
    it('extracts pinned items into the pinned bucket regardless of group', () => {
      const items: TestItem[] = [
        item('1', 'Login', 'Auth'),
        item('2', 'Cards', 'Payments'),
      ];

      const result = groupItems(items, new Set(['1']));

      expect(result.pinned.map((i) => i.id)).toEqual(['1']);
      expect(result.groups.find((g) => g.name === 'Auth')).toBeUndefined();
      expect(result.groups[0].name).toBe('Payments');
    });

    it('sorts pinned items alphabetically by name', () => {
      const items: TestItem[] = [
        item('1', 'Zulu'),
        item('2', 'Alpha'),
        item('3', 'Mike'),
      ];

      const result = groupItems(items, new Set(['1', '2', '3']));

      expect(result.pinned.map((i) => i.name)).toEqual([
        'Alpha',
        'Mike',
        'Zulu',
      ]);
    });

    it('does not duplicate a pinned ungrouped item into the ungrouped bucket', () => {
      const items: TestItem[] = [item('1', 'Loose'), item('2', 'Other')];

      const result = groupItems(items, new Set(['1']));

      expect(result.pinned.map((i) => i.id)).toEqual(['1']);
      expect(result.ungrouped.map((i) => i.id)).toEqual(['2']);
    });
  });
});
