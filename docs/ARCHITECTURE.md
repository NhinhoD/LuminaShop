# KhoUI Architecture & Guidelines

## Clean Architecture + Next.js 16 Physical Boundaries (Option A)

The codebase is cleanly separated into 3 main modules: `src/server`, `src/client`, and `src/shared`.

```
src/
├── server/                      # Server-only execution
│   ├── domain/                  # [Layer 1] Pure Entities & Repository Interfaces
│   ├── application/             # [Layer 2] Pure Business Use Cases
│   ├── infrastructure/          # [Layer 3] Supabase, Payment Gateways, Resend Email
│   ├── presentation/actions/    # [Layer 4] Server Actions ("use server")
│   └── di/                      # Composition Root (container.ts)
├── client/                      # Frontend UI & Client State
│   ├── components/              # UI Components (Storefront, Admin, Common)
│   ├── hooks/                   # Custom React Hooks
│   ├── stores/                  # Zustand Stores (Cart, Toast, Drawer)
│   └── providers/               # Client Context Providers
├── shared/                      # Shared Contracts between Server & Client
│   ├── constants/               # ROUTES, ROLES, pagination defaults
│   ├── validations/             # Zod validation schemas
│   ├── utils/                   # Formatters & helper functions (cn, formatCurrency)
│   └── types/                   # Shared DTOs & Types
└── app/                         # Next.js 16 App Router shell
```

## Dependency Direction

```text
[ Core Server Flow ]
Domain
  ↓
Application
  ↓
Presentation / Server Actions

Infrastructure implements contracts/interfaces used by inner layers.
src/server/di/container.ts serves as the Composition Root wiring concrete infrastructure into application.

[ Client Interaction Flow ]
Client
  ↓
Server Actions
  ↓
Application
  ↓
Domain
```

### Dependency Rules:
- **`domain`**: Does not depend on any other layer or framework. Pure core business rules.
- **`application`**: May depend on `domain` and appropriate contracts in `shared`.
- **`infrastructure`**: Provides concrete implementations of the contracts required by the inner layers and contains external integrations.
- **`presentation/actions`**: Calls application use cases and serves as safe server entry points ("use server").
- **`client`**: Communicates with the server through permitted Server Actions.
  - MUST NOT directly import server-only modules.
  - MUST NOT directly import infrastructure, Supabase client, repositories, or payment gateways.
- **`shared`**: Contains only code safe for shared use between client and server.
- **`src/server/di/container.ts`**: Composition Root responsible for wiring concrete implementations into the application layer.

## Layer Responsibilities

### `src/server/domain/` — Core business rules
- The heart of the software containing **core business rules** and invariants.
- May include:
  - Entities (e.g., `Order`, `Product`)
  - Value Objects
  - Domain interfaces / contracts (e.g., `IOrderRepository`, `IEmailService`)
  - Enums (e.g., `OrderStatus`)
  - Domain Services or Policies
  - Business invariants
  - Result / Error types (`Result<T, E>`)
- **Important**: Do NOT make creating all of the above mandatory for every feature. Only use Value Objects, Domain Services, or Policies when they genuinely represent a domain concept or business rule.
- **Framework Independence**: Zero dependencies on other layers or frameworks:
  - NO Next.js
  - NO React
  - NO Supabase
  - NO infrastructure SDKs
  - NO framework-specific dependencies

### `src/server/application/` — Use cases
- Business logic and orchestration ONLY
- Only imports from `domain/` and `shared/`
- NO direct DB calls, NO supabase client
- Example: `CreateOrderUseCase`, `ProcessPaymentUseCase`

### `src/server/infrastructure/` — Data & external services layer
- Provides concrete implementations of the contracts required by the inner layers.
- Inner layers define abstractions/contracts; infrastructure encapsulates external integrations and delivery mechanisms.
- Application layer MUST NOT directly import concrete infrastructure classes or external SDKs.
- `src/server/di/container.ts` serves as the Composition Root to wire abstractions to concrete implementations, preserving the inward dependency direction.
- ONLY layer allowed to import supabase client, payment SDKs, Resend, or external service adapters.
- Always map `snake_case` DB columns → `camelCase` domain entities.
- Examples: `SupabaseOrderRepository`, `CODPaymentGateway`, `ResendEmailService`, external service adapters.

### `src/server/di/container.ts` — Composition Root (Dependency Injection)
- The ONLY module that couples layers together by wiring concrete infrastructure into application use cases.
- Exposes factories like `makeGetProductsUseCase()`, `makeCreateOrderUseCase()`.
- Server actions import factories from `@/server/di/container`.

### `src/server/presentation/actions/` — Server Actions ("use server")
- Server-side controllers orchestrating use cases and responses
- Sanitizes errors with CWE-209 defense before returning to UI
- Example: `createOrderAction`, `processPaymentAction`, `getPaginatedTranslationsAction`

### `src/client/` — UI Presentation & Client State
- Components, hooks, Zustand stores (`useCartStore`, `useToastStore`), client providers
- Calls application use cases strictly via server actions
- NEVER calls supabase or repositories directly

### `src/shared/` — Shared Contracts
- Zod schemas, constants, formatters, and types usable by both server and client without leakage.

## Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Entities | PascalCase | `Order`, `CartItem` |
| Interfaces | I + PascalCase | `IOrderRepository` |
| Use cases | PascalCase + UseCase | `CreateOrderUseCase` |
| Repositories | Supabase + PascalCase + Repository | `SupabaseOrderRepository` |
| Gateways | PascalCase + Gateway | `CODPaymentGateway` |
| Server actions | camelCase + Action | `createOrderAction` |
| Zustand stores | use + PascalCase + Store | `useCartStore` |
| Components | PascalCase | `CheckoutForm` |
