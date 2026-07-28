.PHONY: install frontend backend dev

install:
	cd frontend && pnpm install
	cd backend && uv sync

frontend:
	cd frontend && pnpm dev

backend:
	cd backend && uv run fastapi dev src/main.py

dev: 
	make -j2 frontend backend
