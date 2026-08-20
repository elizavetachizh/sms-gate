export type PageSearchBase = {
  limit: number;
  offset: number;
};

export function mergePageSearch<TSearch extends PageSearchBase>(
  prev: TSearch,
  next: Partial<TSearch>,
): TSearch {
  return {
    ...prev,
    ...next,
    offset: next.offset ?? (next.limit !== undefined ? 0 : prev.offset),
  };
}
