export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  exact?: boolean;
}

export const APP_ROUTES = {
  home: '/',
  booksSearch: '/books/search',
  booksFavorites: '/books/favorites',
  loans: '/loans',
  contacts: '/contacts',
} as const;

export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { path: APP_ROUTES.home, label: 'Homepage', exact: true },
  { path: APP_ROUTES.booksSearch, label: 'Search Books' },
  { path: APP_ROUTES.booksFavorites, label: 'Favorites' },
  { path: APP_ROUTES.loans, label: 'Loans' },
  { path: APP_ROUTES.contacts, label: 'Contacts' },
];

export const BOOK_NAV_ITEMS: readonly NavItem[] = [
  { path: APP_ROUTES.booksSearch, label: 'Search', icon: 'search.svg' },
  { path: APP_ROUTES.loans, label: 'Loans', icon: 'book-open.svg' },
  { path: APP_ROUTES.booksFavorites, label: 'Favorites', icon: 'heart.svg' },
];
