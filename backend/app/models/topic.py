import uuid

from datetime import datetime

from sqlalchemy import Column, DateTime, JSON, Text
from sqlmodel import Field, Relationship, SQLModel

from app.utils import get_datetime_utc


class Topic(SQLModel, table=True):
    __tablename__ = "topic"  # type: ignore

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    name: str = Field(
        max_length=255,
        nullable=False,
    )
    description: str | None = Field(
        default=None,
        sa_column=Column(Text, nullable=True),
    )
    cognitive_levels: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    mcq_focus: str = Field(
        sa_column=Column(Text, nullable=False),
    )
    key_areas: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    subject_id: uuid.UUID = Field(
        foreign_key="subject.id",
        nullable=False,
        index=True,
        ondelete="CASCADE",
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    subject: "Subject" = Relationship(  # type: ignore
        back_populates="topics",
    )

    questions: list["Question"] = Relationship(  # type: ignore
        back_populates="topic",
        cascade_delete=True,
    )
