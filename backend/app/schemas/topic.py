import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TopicBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    cognitive_levels: list[str]
    mcq_focus: str
    key_areas: list[str]
    subject_id: uuid.UUID


class TopicCreate(TopicBase):
    pass


class TopicUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    description: str | None = None
    cognitive_levels: list[str] | None = None
    mcq_focus: str | None = None
    key_areas: list[str] | None = None
    subject_id: uuid.UUID | None = None


class TopicPublic(TopicBase):
    id: uuid.UUID
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class TopicGenerationRequest(BaseModel):
    subject_id: uuid.UUID
    number_of_topics: int = Field(
        default=10,
        ge=1,
        le=50,
    )


class GeneratedTopic(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    cognitive_levels: list[str]
    mcq_focus: str
    key_areas: list[str]


class TopicGenerationResponse(BaseModel):
    topics: list[GeneratedTopic]


class TopicBulkCreateRequest(BaseModel):
    subject_id: uuid.UUID
    topics: list[GeneratedTopic] = Field(min_length=1)


class TopicBulkCreateResponse(BaseModel):
    topics: list[TopicPublic]
