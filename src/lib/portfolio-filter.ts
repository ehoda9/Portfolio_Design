/**
 * Whether a portfolio item with `itemCategory` should be visible under the
 * selected `filter`. Pure — used by the filter click handler and directly
 * unit tested.
 */
export function shouldShowPortfolioItem(filter: string, itemCategory: string | undefined): boolean {
  return filter === 'all' || itemCategory === filter;
}
