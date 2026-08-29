export function shouldShowPortfolioItem(filter, itemCategory) {
    return filter === 'all' || itemCategory === filter;
}
