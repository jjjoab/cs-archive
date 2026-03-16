import Fuse from 'fuse.js';

export function searchIndex<T = any>(data: T[], query: string, keys?: string[]): T[] {
  if (!query || !query.trim()) return data;
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const activeKeys = (keys && keys.length > 0) ? keys : [
    'title', 'name', 'artists', 'details', 'event', 'parsedTitle', 'fileName', 'date'
  ];

  const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wholeWordPattern = new RegExp(`\\b${escaped}\\b`, 'i');

  const exactMatches = data.filter((item: any) => {
    return activeKeys.some((key) => {
      const value = item?.[key];
      if (value === null || value === undefined) return false;
      const text = String(value).toLowerCase();
      return wholeWordPattern.test(text) || text.includes(normalizedQuery);
    });
  });

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const options: Fuse.IFuseOptions<T> = {
    keys: activeKeys,
    includeScore: true,
    threshold: 0.35,
    distance: 100,
    ignoreLocation: true,
    minMatchCharLength: 2
  } as Fuse.IFuseOptions<T>;

  try {
    const fuse = new Fuse(data, options);
    const results = fuse.search(trimmedQuery);
    return results.map(r => (r.item as T));
  } catch (err) {
    // fallback: very simple substring filter
    const q = normalizedQuery;
    return data.filter((item: any) => {
      return Object.keys(item).some(k => {
        const v = item[k];
        if (!v) return false;
        return String(v).toLowerCase().includes(q);
      });
    });
  }
}

export default searchIndex;
