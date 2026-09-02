import uuid
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class QuestionDifficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class QuestionReviewStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class QuestionBase(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    options: list[str] = Field(min_length=5, max_length=5)
    correct_option: str = Field(min_length=1, max_length=1)
    difficulty: QuestionDifficulty
    cognitive_level: str = Field(min_length=1, max_length=100)
    explanation: str = Field(min_length=1, max_length=600)
    topic_id: uuid.UUID


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    question: str | None = Field(default=None, min_length=1, max_length=500)
    options: list[str] | None = Field(
        default=None,
        min_length=5,
        max_length=5,
    )
    correct_option: str | None = Field(
        default=None,
        min_length=1,
        max_length=1,
    )
    difficulty: QuestionDifficulty | None = None
    cognitive_level: str | None = Field(
        default=None,
        max_length=100,
    )
    explanation: str | None = Field(
        default=None,
        min_length=1,
        max_length=600,
    )
    topic_id: uuid.UUID | None = None


class QuestionReview(BaseModel):
    review_status: QuestionReviewStatus


class QuestionPublic(QuestionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_validated: bool
    review_status: QuestionReviewStatus
    created_at: object | None = None


# ==========================================================================
# Question generation
# ==========================================================================


class DifficultyDistribution(BaseModel):
    easy: int = Field(default=5, ge=0, le=1000)
    medium: int = Field(default=3, ge=0, le=1000)
    hard: int = Field(default=2, ge=0, le=1000)

    @property
    def total(self) -> int:
        return self.easy + self.medium + self.hard

    @model_validator(mode="after")
    def validate_total(self):
        if self.total == 0:
            raise ValueError(
                "At least one difficulty must contain more than 0 questions."
            )

        if self.total > 1000:
            raise ValueError("Total number of questions cannot exceed 1000.")

        return self


class QuestionGenerationRequest(BaseModel):
    topic_ids: list[uuid.UUID] = Field(min_length=1)

    difficulty_distribution: DifficultyDistribution = Field(
        default_factory=DifficultyDistribution,
    )


class GeneratedQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=500)

    options: dict[str, str] = Field(
        min_length=5,
        max_length=5,
    )

    correct_option: str = Field(
        min_length=1,
        max_length=1,
    )

    difficulty: QuestionDifficulty

    cognitive_level: str = Field(
        min_length=1,
        max_length=100,
    )

    explanation: str = Field(
        min_length=1,
        max_length=600,
    )


class QuestionGenerationResponse(BaseModel):
    questions: list[QuestionPublic]
    total_generated: int
    generation_time: float
