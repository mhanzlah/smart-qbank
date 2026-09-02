# Smart QBank

Smart QBank is a question bank management system for creating, managing, reviewing, and organizing MCQs by subject and topic.

It is built with FastAPI, React, PostgreSQL, and uses a local LLM for AI-assisted question generation.

## Technology Stack

* **Backend:** FastAPI, SQLModel, Pydantic
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
* **Database:** PostgreSQL
* **Authentication:** JWT
* **AI:** llama.cpp with Gemma 4
* **Testing:** Pytest, Playwright
* **Deployment:** Docker Compose

## Features

* Subject, topic, and question management
* AI-assisted topic generation
* AI-assisted MCQ generation
* Difficulty and cognitive-level based question generation
* Question review and validation
* Role-based access with Superuser, Editor, and User roles
* Search and management of questions

## Llama

Smart QBank uses `llama-server` for local LLM inference.

```bash
llama-server \
  -hf google/gemma-4-E2B-it-qat-q4_0-gguf:Q4_0 \
  --host 127.0.0.1 \
  --port 8080 \
  -t 8
```

## Documentation

* [Development Guide](./docs/development.md) — setup, environment, database, running the application, and development workflow.
* [User Guide](./docs/user-guide.md) — how to use Smart QBank and manage subjects, topics, and questions.

## License

This project is licensed under the MIT License.
