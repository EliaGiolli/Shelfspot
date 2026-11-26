# 📚 ShelfSpot — Personal Library Management

![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?logo=angular&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-v5-1AD1A5?logo=daisyui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.3-3E67B1?logo=zod&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?logo=vitest&logoColor=white)

A personal library management platform built with **Angular 21**, **Tailwind CSS v4**, **DaisyUI 5**, and **Zod**.

ShelfSpot explores modern Angular development through Signal-based reactivity, runtime API validation, reusable standalone components, reactive request handling, and a repository-based persistence architecture.

The application uses the [Open Library API](https://openlibrary.org/developers) to discover books and retrieve bibliographic information.

---

## ✨ Features

### 🏠 Homepage

| Component | Description |
|---|---|
| `HeroSection` | Editorial hero layout with headline, atmospheric imagery, and call-to-action buttons |
| `BentoGrid` | Responsive dashboard grid with book data, statistics, and quick-search functionality |
| `BookPreview` | Categorised book carousel with data fetched from the Open Library API |
| `Benefits` | Dedicated feature-highlight section with responsive cards |
| `AccordionComponent` | Standalone FAQ accordion with Signal-driven open/close state |

### 🔎 Book Discovery

- **Explicit book search** powered by the Open Library API, triggered by button submission or Enter.
- **Search validation** requiring at least three characters before submitting a request.
- **Dedicated search architecture** separating search orchestration, input handling, and result presentation.
- **URL-synchronised search** preserving submitted queries and pagination across navigation and page refreshes.
- **Book detail pages** with deep-link support.
- **API request states** covering idle, loading, success, empty, error, and not-found scenarios.
- **Retry actions** for failed search and book detail requests.
- **Cover fallback pipe** for books without available cover images.
- **Runtime API validation** with Zod schemas before mapping external data into application models.

### 📬 Contact Form

- Signal-based form state.
- Custom email validation.
- Errors displayed after user interaction.
- Accessibility support with `aria-invalid`, `aria-describedby`, and `role="alert"`.

### 🔖 Loans & Favourites

- **`LoanService`** — Signal-based loan management, duplicate-loan prevention, due dates, and book returns.
- **`FavoriteService`** — Add and remove favourites, check favourite status, and retrieve the user's favourite books.
- **Repository-based persistence** — Application services interact with repository interfaces instead of accessing LocalStorage directly.
- **Runtime data validation** — Zod schemas validate persisted data before it enters the application.

---

## 🏗️ Architecture

ShelfSpot follows a feature-oriented structure, with shared UI components, core services, and dedicated application features.

```text
src/
├── app/
│   ├── core/
│   │   ├── errors/           # Application API errors
│   │   ├── interceptors/     # HTTP error handling
│   │   ├── mappers/          # API DTO to application model mapping
│   │   ├── services/         # HTTP, loans, and favourites services
│   │   └── tokens/           # Dependency injection tokens
│   │
│   ├── features/
│   │   ├── book-search/
│   │   │   ├── book-detail/
│   │   │   ├── search-book-input/
│   │   │   ├── search-container/
│   │   │   ├── search-page/
│   │   │   ├── search-results/
│   │   │   └── sidebar/
│   │   │
│   │   ├── contacts/
│   │   ├── favorites/
│   │   ├── loans/
│   │   ├── not-found/
│   │   └── layouts/
│   │       ├── homepage/
│   │       ├── main-layout/
│   │       ├── auth-layout/
│   │       └── book-layout/
│   │
│   └── shared/
│       ├── components/       # Reusable UI components
│       ├── directives/       # Shared directives
│       ├── pipes/            # Cover fallback pipe
│       ├── schemas/          # Shared Zod schemas
│       ├── types/            # Shared TypeScript types
│       ├── utils/            # Component variant helpers
│       └── validators/       # Custom validators
│
├── assets/                   # Static assets
└── styles.css                # Global Tailwind and DaisyUI theme
```

---

## 🔍 Search Architecture

The book discovery feature follows a **container/presentational component architecture**, separating business logic from UI presentation.

| Component | Responsibility |
|---|---|
| `SearchContainer` | Smart component responsible for API requests, RxJS streams, URL synchronisation, pagination, and navigation |
| `SearchPage` | Presentational component responsible for composing the search interface |
| `SearchBookInput` | Handles user input, validation, and explicit search submission |
| `SearchResults` | Displays API states, book results, pagination, and retry actions |
| `BookDetail` | Displays individual book information and handles detail request states |
| `HttpBookService` | Handles communication with the Open Library API |

This separation keeps business logic out of presentation components and makes individual components easier to test, reuse, and maintain.

### Search Flow

```text
User Input
    │
    ▼
SearchBookInput
    │
    │ Explicit submission
    ▼
SearchContainer
    │
    ├── URL query parameters
    │
    ├── Search orchestration
    │
    ├── Pagination
    │
    ▼
HttpBookService
    │
    ▼
Open Library API
    │
    ▼
API Response
    │
    ▼
SearchContainer
    │
    ▼
SearchPage
    │
    ▼
SearchResults
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 — Standalone Components, Signals, `inject()` |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| Language | TypeScript with strict type checking |
| Validation | Zod 4 — runtime validation of API responses and persisted data |
| Async | RxJS 7.8 — `switchMap`, `forkJoin`, `catchError`, `toSignal` |
| API | [Open Library API](https://openlibrary.org/developers) |
| Persistence | Repository Pattern + LocalStorage |
| Unit testing | Vitest 4.1, Angular testing utilities, jsdom |
| Icons | Custom SVG icon component |

---

## ⚡ Key Patterns

### Signal-driven State

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

### Explicit Search Submission and URL Synchronisation

The search feature follows an explicit submission model rather than search-as-you-type.

- Users submit searches through the search button or Enter.
- Queries must contain at least three characters.
- The input value is kept separate from the submitted query.
- Search queries and pagination are synchronised with URL parameters.
- `switchMap` handles changing search requests and prevents outdated responses from replacing newer results.
- `toSignal` exposes reactive API state to component templates.
- `catchError` handles request failures without terminating the search stream.
- Retry actions allow users to repeat failed requests.

### API Request State Management

A generic `ApiState<T>` type represents the lifecycle of API requests throughout the application.

| State | Description |
|---|---|
| `idle` | No active request |
| `loading` | A request is in progress |
| `success` | A valid response containing results |
| `empty` | A successful request with no matching results |
| `error` | A network or processing failure |
| `not-found` | The requested book does not exist |

This approach provides consistent UI feedback and prevents successful empty responses from being confused with API failures.

### Runtime Validation with Zod

External API responses and persisted data are validated before they are used by the application.

Zod schemas provide runtime validation and inferred TypeScript types, reducing the risk of unexpected data entering application services and components.

### API Data Mapping

Dedicated mapper functions convert Open Library DTOs into the shared `Book` model.

This keeps API-specific response structures separate from the rest of the application and prevents external data formats from leaking into feature components.

### Centralised HTTP Error Handling

The HTTP error interceptor converts network, HTTP, and unexpected errors into a consistent `ApiError` type, making error handling more predictable across the application.

### Parallel HTTP Requests with `forkJoin`

The Book Preview can retrieve multiple subject categories in parallel and combine their results into a single collection.

### Reusable Component Variants

Reusable variant utilities centralise styling for buttons, cards, and inputs, helping maintain consistent visual patterns across the application.

---

## 💾 Persistence Architecture

ShelfSpot uses the **Repository Pattern** to decouple application services from persistence implementations.

- `FavoritesRepository` defines the contract for retrieving and saving favourite books.
- `LoansRepository` defines the contract for retrieving and saving loans.
- LocalStorage adapters provide the current persistence implementation.
- Zod schemas validate persisted data before it enters the application.
- Dedicated serializers and deserializers handle loan date conversion between JavaScript `Date` objects and ISO 8601 strings.
- Injection tokens allow repository implementations to be replaced without changing application services.

The architecture is designed to support a future migration to Supabase, including authentication and cross-device synchronisation.

**Current scope:** Local persistence without user authentication. Supabase integration is planned for a future development phase.

---

## 📱 Responsive Design

The interface is designed to adapt to mobile, tablet, and desktop screen sizes.

| Area | Improvement |
|---|---|
| `HeroSection` | Responsive hero image sizing and layout |
| `BentoGrid` | One-column mobile, two-column tablet, and four-column desktop layouts |
| `BookPreview` carousel | Full-width cards on mobile and three-column layout on larger screens |
| Cover images | Responsive cover dimensions |
| Category navigation | Flexible navigation layout for smaller screens |
| Navbar and Sidebar | Responsive navigation and mobile menu behavior |
| Skeleton items | Match the dimensions of the corresponding carousel cards |

---

## ♿ Accessibility

Accessibility is considered throughout the interface.

- Semantic HTML elements such as `article`, `nav`, `section`, and `header`.
- Accessible labels and descriptive alternative text for informative images.
- Empty alternative text for decorative images.
- ARIA attributes including `aria-label`, `aria-describedby`, `aria-invalid`, and `aria-current`.
- Visible keyboard focus indicators on interactive elements.
- Keyboard-accessible navigation and controls.
- `role="status"` for status messages and `role="alert"` for errors.
- Accessible form validation and feedback.

---

## 🧪 Testing

The project uses **Vitest 4.1** with Angular's native testing integration, Angular testing utilities, and jsdom.

The test suite covers application services, data validation, API handling, and component behavior.

| Area | Coverage |
|---|---|
| Zod schemas | API payload and persisted data validation |
| Book mappers | Conversion of API responses into application models |
| `HttpBookService` | API requests, response validation, and error handling |
| `ApiError` and HTTP interceptor | Error types, status codes, and HTTP error handling |
| `ApiState` | API request lifecycle states |
| `BookDetail` | Loading, success, not-found, error, and retry behavior |
| `FavoriteService` | Repository integration and favourite management |
| `LoanService` | Repository integration, duplicate prevention, due dates, and returns |
| `SearchBookInput` | Input validation and explicit search submission |
| `SearchResults` | Result rendering, API states, retry, and pagination |
| `SearchContainer` | Search orchestration, routing, pagination, and API requests |
| `SearchPage` | Presentational component inputs and outputs |
| Shared components | Buttons, inputs, cards, icons, and other reusable UI elements |

### Running Tests

Run tests using Angular CLI:

```bash
npm test
```

Run the complete test suite once without watch mode:

```bash
npm run test:ci
```

The project uses Angular's native Vitest runner rather than the legacy AnalogJS integration.

**Known testing limitation:** The `LocalStorageFavoritesRepository` tests currently require additional work because `localStorage` is unavailable in the current Node.js 26 test execution environment. This is a temporary testing limitation; the persistence implementation is planned to migrate to Supabase in a future development phase.

---

## 🏠 Homepage Refactor

The homepage is organised into dedicated standalone components rather than keeping every section inside the main homepage component.

| Before | After |
|---|---|
| Benefits section inlined in the homepage | Dedicated `Benefits` component |
| FAQ accordion inlined in the homepage | Dedicated `AccordionComponent` |
| Homepage owns section-specific static data | Each section owns its own data model |

This separation makes individual sections easier to maintain, reuse, and test.

---

## 🚫 404 Page

The not-found page is built with Tailwind CSS utility classes and DaisyUI components, without additional custom CSS.

It provides navigation back to the homepage and other relevant sections.

---

## 🚀 Getting Started

### Requirements

- Node.js version compatible with Angular 21.
- npm.
- Angular CLI compatible with Angular 21.

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd shelfspot
npm install
```

### Development Server

Start the local development server:

```bash
npm start
```

Open `http://localhost:4200/` in your browser.

### Run Tests

```bash
npm test
```

Run tests once without watch mode:

```bash
npm run test:ci
```

### Production Build

```bash
npm run build
```

---

## 🗺️ Roadmap

Potential future improvements include:

- **Supabase integration** — Replace local persistence with a cloud-backed repository implementation.
- **Authentication** — Add user registration, login, and account management.
- **Cross-device synchronisation** — Keep favourites and loans synchronised across devices.
- **Extended library management** — Introduce additional tools for organising and tracking personal book collections.

---

## 📝 Project Goals

ShelfSpot explores how far modern Angular features can go without relying on heavyweight state-management or form libraries.

The main areas of focus are:

- Standalone components and dependency injection.
- Signal-based reactive state.
- RxJS interoperability for asynchronous operations.
- Runtime validation with Zod.
- Separation between API data structures and application models.
- Repository-based persistence.
- Consistent API error handling and request state management.
- Container/presentational component architecture.
- Unit testing with Angular's native Vitest integration.
- Responsive design and accessibility.

---

## 🔗 Quick Links

- [Open Library API Documentation](https://openlibrary.org/developers)
- [Angular Documentation](https://angular.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [Zod Documentation](https://zod.dev/)
- [RxJS Documentation](https://rxjs.dev/)
- [Vitest Documentation](https://vitest.dev/)