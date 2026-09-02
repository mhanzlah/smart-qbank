# Smart QBank — Backend

The Smart QBank backend is built with FastAPI and provides the API, authentication, database operations, question management, and AI-assisted topic and question generation.

## Requirements

* [Docker](https://www.docker.com/)
* [uv](https://docs.astral.sh/uv/)

## Local Development

Start PostgreSQL using Docker Compose:

```console
$ docker compose up -d db
```

From the `backend/` directory, install dependencies, prepare the database, and start the development server:

```console
$ uv sync
$ uv run bash scripts/prestart.sh
$ uv run fastapi dev
```

The API is available at `http://localhost:8000`.

Interactive API documentation:

* `http://localhost:8000/docs`
* `http://localhost:8000/redoc`

## Project Structure

```text
backend/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Configuration and database
│   ├── crud/         # Database CRUD operations
│   ├── models/       # SQLModel database models
│   ├── schemas/      # Request and response schemas
│   ├── services/     # Application and AI services
│   └── main.py       # Application entry point
├── scripts/          # Development and test scripts
├── tests/            # Backend tests
└── alembic/          # Database migrations
```

## AI Generation

Smart QBank uses a local LLM through `llama-server` for:

* AI-assisted topic generation
* AI-assisted MCQ generation

Start the Llama server before using the generation features:

```console
$ llama-server \
    -hf google/gemma-4-E2B-it-qat-q4_0-gguf:Q4_0 \
    --host 127.0.0.1 \
    --port 8080 \
    -t 8
```

## Database Migrations

Smart QBank uses Alembic for database migrations.

After changing a database model, create a migration:

```console
$ uv run alembic revision --autogenerate -m "Describe the change"
```

Apply migrations:

```console
$ uv run alembic upgrade head
```

Migration files are stored in `./backend/alembic/versions/` and should be committed to the repository.

## Backend Tests

Run the backend test suite from `backend/`:

```console
$ uv run bash scripts/test.sh
```

Tests use Pytest and are located in:

```text
backend/tests/
```

To run tests against an already running Docker Compose stack:

```console
$ docker compose exec backend bash scripts/tests-start.sh
```

Pytest arguments can be passed to the script:

```console
$ docker compose exec backend bash scripts/tests-start.sh -x
```

Test coverage is generated in `htmlcov/index.html`.

## Docker Compose

To run the full application stack:

```console
$ docker compose watch
```

The application is available at:

```text
http://localhost:8000
```

To open a shell inside the backend container:

```console
$ docker compose exec backend bash
```

## Development Workflow

Run backend commands from `backend/` using `uv run`.

When adding or changing functionality:

1. Update the relevant models, schemas, services, or API routes.
2. Create a database migration if models were changed.
3. Add or update tests.
4. Run the backend test suite.
5. Verify the API through the interactive documentation when needed.
