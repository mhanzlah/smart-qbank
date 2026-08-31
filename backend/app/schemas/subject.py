import uuid
from datetime import datetime

from sqlmodel import SQLModel


class SubjectBase(SQLModel):
    name: str
    code: str | None = None
    clo: str | None = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(SQLModel):
    name: str | None = None
    code: str | None = None
    clo: str | None = None


class SubjectPublic(SubjectBase):
    id: uuid.UUID
    created_at: datetime
