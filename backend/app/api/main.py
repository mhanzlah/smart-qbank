from fastapi import APIRouter

from app.api.routes import login, private, questions, subjects, topics, users, utils
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(questions.router)
api_router.include_router(subjects.router)
api_router.include_router(topics.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)


if settings.FASTAPI_ENV == "development":
    api_router.include_router(private.router)
