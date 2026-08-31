import uuid
from datetime import datetime

from sqlalchemy import DateTime, Text
from sqlmodel import Field, Relationship, SQLModel

from app.utils import get_datetime_utc


class Subject(SQLModel, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    name: str = Field(
        max_length=255,
        index=True,
        unique=True,
    )

    code: str | None = Field(
        default=None,
        max_length=50,
        unique=True,
    )

    clo: str | None = Field(
        default=None,
        sa_type=Text,
    )

    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    topics: list["Topic"] = Relationship(  # type: ignore
        back_populates="subject",
        cascade_delete=True,
    )
