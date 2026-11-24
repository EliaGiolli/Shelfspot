# 📚 ShelfSpot — Personal Library Management

![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?logo=angular&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-v5-1AD1A5?logo=daisyui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.3-3E67B1?logo=zod&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?logo=vitest&logoColor=white)

A personal library management platform built with **Angular 21**, **Tailwind CSS v4**, **DaisyUI 5**, and **Zod**. The project showcases Signal-based reactivity, runtime API validation, reusable standalone components, and a testable service-oriented architecture.

---

## ✨ Features

### 🏠 Homepage

| Component | Description |
|---|---|
| `HeroSection` | Editorial DaisyUI hero layout with headline, atmospheric image, and CTA buttons |
| `BentoGrid` | Responsive dashboard grid with book data, stats, and quick-search preview |
| `BookPreview` | Categorised book carousel with data fetched from the Open Library API |
| `Benefits` | Standalone feature-highlight section with responsive cards |
| `AccordionComponent` | Standalone FAQ accordion with Signal-driven open/close state |

### 🔎 Book Discovery

- **Search page** powered by the Open Library API, with debounced input and URL query parameters.
- **Search pagination** synchronised with the URL.
- **Book detail pages** with deep-link support.
- **Cover fallback pipe** for books without available cover images.
- **Runtime API validation** with Zod schemas before mapping external data into application models.

### 📬 Contact Form

- Signal-based form state.
- Custom email validation.
- Errors displayed after user interaction.
- Accessibility support with `aria-invalid`, `aria-describedby`, and `role="alert"`.

### 🔖 Loans & Favourites

- **`LoanService`** — Signal-based loan management, duplicate-loan prevention, due dates, and book returns.
- **`FavoriteService`** — add and remove favourites, check favourite status, and persist the list in local storage.

---

## 🏗️ Architecture

```text
src/
├── app/
│   ├── core/
│   │   ├── errors/          # Application API errors
│   │   ├── interceptors/    # HTTP error handling
│   │   ├── mappers/         # API DTO to application model mapping
│   │   ├── schemas/         # Zod schemas and inferred types
│   │   ├── services/        # HTTP, loans, and favourites services
│   │   └── tokens/          # Injection tokens
│   │
│   ├── features/
│   │   ├── auth/            # Login and register pages
│   │   ├── book-search/     # Search page and book details
│   │   ├── contacts/        # Contact form
│   │   ├── favorites/       # Favourites page
│   │   ├── loans/           # Loans page
│   │   ├── not-found/       # 404 page
│   │   └── layouts/
│   │       ├── homepage/
│   │       ├── main-layout/
│   │       ├── auth-layout/
│   │       └── book-layout/
│   │
│   └── shared/
│       ├── components/      # Reusable UI components
│       ├── directives/      # Shared directives
│       ├── pipes/           # Cover fallback pipe
│       ├── types/           # Shared TypeScript types
│       ├── utils/           # Component variant helpers
│       └── validators/      # Custom validators
│
├── assets/                  # Static assets
└── styles.css               # Global Tailwind and DaisyUI theme
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 — Standalone Components, Signals, `inject()` |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| Language | TypeScript with strict type checking |
| Validation | Zod 4 — runtime validation of API responses |
| Async | RxJS 7.8 — `switchMap`, `forkJoin`, `toSignal` |
| API | [Open Library API](https://openlibrary.org/developers) |
| Unit testing | Vitest 4.1, Angular testing utilities, jsdom |
| Icons | Custom SVG icon component |

---

## ⚡ Key Patterns

### Signal-driven state

Signals and computed values handle local reactive state without introducing an additional state-management library.

```ts
protected selectedCategory = signal<
  'all' | 'fiction' | 'science' | 'classics'
>('all');

protected books = signal<Book[]>([]);
protected isLoading = signal(false);

protected expandedIndex = signal<number | null>(null);

protected toggleFaq(index: number): void {
  this.expandedIndex.update(current =>
    current === index ? null : index
  );
}
```

### Reactive search and URL synchronisation

The search page uses RxJS to debounce user input, update URL query parameters, and avoid unnecessary API requests.

- Search input is debounced by 250 ms.
- Search query and current page are reflected in the URL.
- `switchMap` handles changing search requests.
- `toSignal` exposes the response to the component template.
- Queries shorter than three characters do not trigger API requests.

### Runtime validation with Zod

External API responses are validated before they are used by the application. Invalid payloads are handled as validation errors rather than being trusted as application data.

### API data mapping

Dedicated mapper functions convert Open Library DTOs into the shared `Book` model. This keeps API-specific response structures separate from the rest of the application.

### Centralised HTTP error handling

The HTTP error interceptor converts network, HTTP, and unexpected errors into a consistent `ApiError` type, making error handling more predictable across the application.

### Parallel HTTP requests with `forkJoin`

The Book Preview can retrieve multiple subject categories in parallel and combine their results into a single collection.

### CVA-style variant utilities

Reusable variant helpers keep component styling consistent and centralise button, card, and input variants.

---

## 🧪 Testing

The project uses **Vitest** with Angular testing utilities and jsdom.

Unit tests cover the main data and application logic:

| Area | Coverage |
|---|---|
| Zod schemas | API payload validation and inferred data structures |
| Book mappers | Conversion of API responses into application models |
| `HttpBookService` | API requests, response validation, and error handling |
| `ApiError` and HTTP interceptor | Error types, status codes, and successful responses |
| `BookDetailComponent` | Loading, success, not-found, errors, and route parameter changes |
| `FavoriteService` | Local storage, adding/removing favourites, and lookup |
| `LoanService` | Loan creation, duplicate prevention, due dates, and returns |
| `SearchPage` | Search requests, URL synchronisation, pagination, and debouncing |

Run the test suite:

```bash
npm test
```

Run tests once without watch mode:

```bash
npm test -- --run
```

---

## 🏠 Homepage Refactor

The homepage is organised into dedicated standalone components rather than keeping every section inside the main homepage component.

| Before | After |
|---|---|
| Benefits section inlined in the homepage | Dedicated `Benefits` component |
| FAQ accordion inlined in the homepage | Dedicated `AccordionComponent` |
| Homepage owns section-specific static data | Each section owns its own data model |

This separation makes individual sections easier to maintain and test.

---

## 📱 Mobile UX

| Area | Improvement |
|---|---|
| `HeroSection` | Hero image hidden on mobile and displayed on larger screens |
| `BookPreview` carousel | Full-width cards on mobile and three-column layout on desktop |
| Cover images | Responsive cover heights |
| Category navigation | Prevents unwanted wrapping on smaller screens |
| Skeleton items | Match the dimensions of the corresponding carousel cards |

---

## 404 Page

The not-found page is built with Tailwind CSS utility classes and DaisyUI components, without additional custom CSS. It provides navigation back to the homepage and other relevant sections.

---

## 🚀 Getting Started

### Requirements

- Node.js 20+
- npm
- Angular CLI compatible with Angular 21

### Installation

```bash
# Install dependencies
npm install

# Start the development server
ng serve

# Run tests
npm test

# Create a production build
ng build
```

---

## ♿ Accessibility

Accessibility is considered throughout the interface:

- Semantic HTML elements such as `article`, `nav`, `section`, and `header`.
- ARIA attributes including `aria-label`, `aria-describedby`, `aria-invalid`, and `aria-current`.
- Native HTML dialog elements for modal interactions.
- Keyboard-accessible interactive components.
- Screen-reader-only text where needed.
- `role="status"` for loading states and `role="alert"` for form errors.

---

## 📝 Project Goals

ShelfSpot explores how far modern Angular features can go without relying on heavyweight state-management or form libraries.

The focus is on:

- Standalone components and dependency injection.
- Signal-based reactive state.
- RxJS interop for asynchronous operations.
- Runtime validation with Zod.
- Separation between API data structures and application models.
- Consistent error handling.
- Unit testing of core logic and user-facing flows.

---

## 🔗 Quick Links

- [Open Library API Documentation](https://openlibrary.org/developers/api)
- [Angular Documentation](https://angular.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)