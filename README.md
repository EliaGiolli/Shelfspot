# 📚 ShelfSpot — Personal Library Management

> A high-performance, accessible library management platform built with **Angular 19+**, **DaisyUI**, and **Zod**. Showcases modern Signal-based reactivity, strict runtime validation, and a component-driven architecture.

---

## ✨ Features

### 🏠 Homepage

| Component | Description |
|---|---|
| `HeroSection` | Editorial DaisyUI `hero` layout — serif headline, atmospheric image, two CTA buttons. Image is hidden on mobile and shown on `lg+` screens for a focused mobile experience |
| `BentoGrid` | 4-column responsive dashboard grid with live book data, stats, and a quick-search preview card |
| `BookPreview` | Categorised book carousel with real-time pagination fetched from the OpenLibrary API. Cards are full-width on mobile and 3-column on `md+` using `calc()`-based widths |
| `Benefits` | Standalone feature-highlight section — 3 `featured` cards with icon badges, an eyebrow label, and lift-on-hover animation |
| `AccordionComponent` | Standalone FAQ section built with DaisyUI's `collapse` — signal-driven open/close state, fully keyboard-accessible |

### 🔎 Book Discovery

- **Search page** powered by the OpenLibrary API with `switchMap` debouncing
- **Native `<dialog>` modals** for book details with focus trapping and deep-link support via URL parameters
- **Cover fallback pipe** — gracefully handles missing cover images
- **Deep-linked detail pages** — every book card in the preview carousel links to `/books/search/:id` using the correct Open Library work ID

### 📬 Contact Form

- **Signal-based state** — no `ReactiveFormsModule` overhead
- Custom email validator (professional domain check)
- Errors shown only after user interaction (`touched` state)
- Full ARIA support: `aria-invalid`, `aria-describedby`, `role="alert"`

### 🔖 Loans & Favourites _(in progress)_

- `LoanService` — real-time local persistence of borrowed books
- `FavouriteService` — bookmark and retrieve favourite titles

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── schemas/         # Zod schemas + inferred TypeScript types
│   │   ├── services/        # HttpBookService, LoanService, FavouritesService
│   │   └── tokens/          # Injection tokens (API_URL)
│   │
│   ├── features/
│   │   ├── auth/            # Login & Register pages
│   │   ├── book-search/     # Search page, modal, sidebar
│   │   ├── contacts/        # Contact form
│   │   ├── favorites/       # Favourites page
│   │   ├── loans/           # Loans page
│   │   ├── not-found/       # 404 page (Tailwind + DaisyUI, no custom CSS)
│   │   └── layouts/
│   │       ├── homepage/
│   │       │   ├── herosection/         # DaisyUI hero (image + CTAs)
│   │       │   ├── bento-grid/          # Dashboard grid with live data
│   │       │   ├── book-preview/        # Categorised carousel with pagination
│   │       │   ├── benefits/            # Feature-highlight card grid (standalone)
│   │       │   └── accordion-component/ # FAQ accordion (DaisyUI collapse, standalone)
│   │       ├── main-layout/
│   │       ├── auth-layout/
│   │       └── book-layout/
│   │
│   └── shared/
│       ├── components/      # Card, Button, ButtonLink, Icon, Input,
│       │                    # Navbar, Footer, BookSkeleton, LoadingSpinner, Tooltip
│       ├── directives/      # ClickFeedback, Tooltip
│       ├── pipes/           # CoverFallback
│       ├── types/           # Shared TypeScript interfaces
│       ├── utils/           # CVA-style variant helpers (btn, card, input)
│       └── validators/      # Signal-based custom validators
│
├── assets/                  # Static images served at build time
└── styles.css               # Global Tailwind + DaisyUI theme (shelfspot)
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| ⚙️ **Framework** | Angular 19+ — Standalone Components, Signals, `input()` / `inject()` |
| 🎨 **Styling** | Tailwind CSS v4 + DaisyUI v5 (`shelfspot` custom theme) |
| ✔️ **Validation** | Zod — runtime schema validation on all API responses |
| 🔄 **Async** | RxJS — `switchMap`, `forkJoin`, `toSignal` |
| 🌐 **API** | [OpenLibrary API](https://openlibrary.org/developers) |
| 🧩 **Icons** | Custom SVG icon component (`IconComponent`) |
| 🛡️ **Type Safety** | Strict TypeScript throughout; Zod-inferred types for all API shapes |

---

## ⚡ Key Patterns

### Signal-driven state

```ts
// No BehaviorSubject, no store boilerplate
protected selectedCategory = signal<'all' | 'fiction' | 'science' | 'classics'>('all');
protected books = signal<BookSearchResult[]>([]);
protected isLoading = signal(false);

// AccordionComponent — single expanded index, toggled on click
protected expandedIndex = signal<number | null>(null);
protected toggleFaq(index: number): void {
  this.expandedIndex.update(current => current === index ? null : index);
}
```

### Parallel HTTP with `forkJoin`

```ts
// BookPreview — "all" category fires 3 requests in parallel, deduplicates results
forkJoin([
  this.httpBookService.getBooksBySubject('fiction', page),
  this.httpBookService.getBooksBySubject('science', page),
  this.httpBookService.getBooksBySubject('classics', page),
]).pipe(
  map(([fiction, science, classics]) => [...fiction, ...science, ...classics])
)
```

### Zod schema + normalisation

```ts
// SubjectResponseSchema maps the /subjects endpoint shape
// back to the shared BookSearchResult format used everywhere
return result.data.works.map(book => ({
  key:                book.key,
  title:              book.title,
  author_name:        book.authors?.map(a => a.name) ?? [],
  cover_i:            book.cover_id,
  first_publish_year: book.first_publish_year,
}));
```

### CVA-style variant utils

```ts
// btn-custom-variants.ts — single source of truth for all button styles
export const ButtonLinks: ButtonStyles = {
  base: 'btn whitespace-nowrap px-4 py-4 ...',
  variants: {
    primary: 'btn-primary shadow-lg hover:bg-secondary',
    outline: 'btn-ghost',
    accent:  'btn-error text-white ...',
  }
};
```

### Static input bindings (no redundant brackets)

All `input()`-based component inputs that receive **static string values** use the attribute form — no square brackets:

```html
<!-- ✅ Correct — static string, no JS evaluation needed -->
<app-button-link variant="primary" routerLink="/books/search" ariaLabel="Browse">
<app-card variant="featured" [titleId]="'benefit-' + $index">

<!-- ✅ Correct — dynamic value, brackets required -->
<app-card [titleId]="'benefit-' + $index">
<app-button-link [routerLink]="['/books/search', book.key.split('/').pop()]">
```

### Responsive carousel widths with `calc()`

```html
<!-- 100% = carousel width, 2rem = total gap between 3 cards, ÷3 = each card's share -->
<article class="carousel-item w-full px-2 md:w-[calc((100%-2rem)/3)]">
```

---

## 🏠 Homepage Refactor (latest)

The homepage has been significantly slimmed down. Benefits and FAQ sections that were previously inlined inside `homepage.html` and `homepage.ts` are now **dedicated standalone components** with their own data models:

| Before | After |
|---|---|
| Benefits inlined in `homepage.html` with `CardComponent` | `<app-benefits />` — `Benefits` standalone component |
| FAQ accordion inlined in `homepage.html` with `IconComponent` | `<app-accordion-component />` — `AccordionComponent` standalone |
| `homepage.ts` imported `CardComponent`, `IconComponent` | `homepage.ts` imports only layout-level components |
| Static data (`benefits`, `faqs`) owned by `Homepage` | Each component owns its own model file |

This reduces `homepage.ts` from 28 to 15 lines and makes each section independently testable.

---

## 📱 Mobile UX Improvements (latest)

| Area | Change |
|---|---|
| `HeroSection` | Hero image is `hidden` on mobile, `flex` on `lg+` |
| `BookPreview` carousel | Cards are `w-full` on mobile, `md:w-[calc((100%-2rem)/3)]` on desktop |
| `BookPreview` cover height | `h-48` on mobile → `h-64` on `md+` |
| Category filter nav | `flex-nowrap` on mobile, `flex-wrap` on `md+` to avoid line breaks |
| Skeleton items | Match carousel card widths for consistent loading state |

---

## 404 Page

The not-found page is entirely utility-class driven — **zero custom CSS**. It uses a DaisyUI card (`bg-base-100`, `rounded-box`, `border-base-300`) with a `404` gradient text, a decorative top-border line, and two `app-button-link` actions pointing back to the homepage and projects.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
ng serve

# Run tests
ng test

# Production build
ng build --configuration production
```

> **Node 20+** and **Angular CLI 19+** required.

---

## ♿ Accessibility

Every interactive component is built with accessibility first:

- Semantic HTML (`<article>`, `<nav>`, `<section aria-labelledby>`, `<header>`)
- `aria-label`, `aria-describedby`, `aria-invalid`, `aria-current`, `aria-live`
- Native `<dialog>` for modals (built-in focus trapping, `Escape` to close)
- DaisyUI `collapse` for FAQ — keyboard-navigable via `<input type="checkbox">`
- Screen-reader-only text via `.sr-only` where visual context is enough
- `role="status"` on loading states, `role="alert"` on form errors

---

## 📝 Note for Reviewers

This project demonstrates specialisation in **zoneless-ready Angular** without NgZone patching, complex stores, or heavyweight form libraries. The goal is to show how far you can get with the framework's own primitives — Signals, `inject()`, standalone components, and RxJS interop — while keeping the codebase lean, readable, and type-safe end to end.

---

## 🔗 Quick Links

- 🚀 [Live Demo](#)
- 📖 [OpenLibrary API Docs](https://openlibrary.org/developers/api)
- 🗂️ [Main Repository](#)
