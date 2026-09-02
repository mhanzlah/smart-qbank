# Smart QBank — Frontend

The Smart QBank frontend is built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It provides the interface for managing subjects, topics, questions, users, and AI-assisted generation.

## Technology Stack

* **React** — UI
* **TypeScript** — Type safety
* **Vite** — Development and build tooling
* **TanStack Query** — Server state management
* **TanStack Router** — Routing
* **Tailwind CSS** — Styling
* **shadcn/ui** — UI components
* **Playwright** — End-to-end testing

## Requirements

* [Bun](https://bun.sh/)

## Quick Start

From the project root, install dependencies and start the frontend:

```bash
bun install
bun run dev
```

The development server runs at:

```text
http://localhost:5173
```

The backend and PostgreSQL database must also be running for the application to work correctly. See the [Development Guide](../docs/development.md) for the complete setup.

## Production Build

Build the frontend with:

```bash
bun run build
```

The built frontend is served by FastAPI when running the application in production mode.

## API Client

The frontend uses an automatically generated OpenAPI client for communication with the FastAPI backend.

To regenerate the client after backend API changes:

```bash
bash ./scripts/generate-client.sh
```

or

```bash
bun run generate-client
```

The generated client is located in:

```text
frontend/src/client/
```

Regenerate and commit the client whenever backend changes affect the OpenAPI schema.

## Code Structure

```text
frontend/
├── src/
│   ├── client/       # Generated OpenAPI client
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Shared utilities
│   └── routes/       # Application routes and pages
├── public/           # Static assets
└── package.json
```

## End-to-End Testing

Smart QBank uses Playwright for end-to-end testing.

Make sure the application stack is running, then run:

```bash
bunx playwright test
```

To run tests in UI mode:

```bash
bunx playwright test --ui
```

Tests are located in the frontend test directory.

For more information, see the [Playwright documentation](https://playwright.dev/docs/intro).
