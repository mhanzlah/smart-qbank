import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, JSON, Text
from sqlmodel import Field, Relationship, SQLModel

from app.utils import get_datetime_utc


class QuestionDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuestionReviewStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Question(SQLModel, table=True):
    __tablename__ = "question"  # type: ignore

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    question: str = Field(
        sa_column=Column(Text, nullable=False),
    )

    options: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )

    correct_option: str = Field(
        max_length=1,
        nullable=False,
    )

    difficulty: QuestionDifficulty = Field(
        nullable=False,
    )

    cognitive_level: str = Field(
        max_length=50,
        nullable=False,
    )

    explanation: str = Field(
        sa_column=Column(Text, nullable=False),
    )

    is_validated: bool = Field(
        default=False,
        nullable=False,
    )

    review_status: QuestionReviewStatus = Field(
        default=QuestionReviewStatus.PENDING,
        nullable=False,
    )

    topic_id: uuid.UUID = Field(
        foreign_key="topic.id",
        nullable=False,
        index=True,
        ondelete="CASCADE",
    )

    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    topic: "Topic" = Relationship(  # type: ignore
        back_populates="questions",
    )
