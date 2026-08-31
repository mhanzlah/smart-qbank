import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentEditor, CurrentUser, SessionDep
from app.crud import subject as subject_crud
from app.crud import topic as topic_crud
from app.models.subject import Subject
from app.models.topic import Topic
from app.schemas.topic import (
    TopicBulkCreateRequest,
    TopicBulkCreateResponse,
    TopicCreate,
    TopicGenerationRequest,
    TopicGenerationResponse,
    TopicPublic,
    TopicUpdate,
)
from app.services.topic_generation import TopicGenerationService

router = APIRouter(
    prefix="/topics",
    tags=["topics"],
)


@router.get(
    "/",
    response_model=list[TopicPublic],
)
def read_topics(
    session: SessionDep,
    current_user: CurrentUser,
    subject_id: uuid.UUID | None = None,
) -> list[Topic]:
    return topic_crud.get_topics(
        session=session,
        subject_id=subject_id,
    )  # type: ignore


@router.get(
    "/{topic_id}",
    response_model=TopicPublic,
)
def read_topic(
    topic_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentEditor,
) -> Topic:
    topic = topic_crud.get_topic(
        session=session,
        topic_id=topic_id,
    )

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )

    return topic


@router.post(
    "/",
    response_model=TopicPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_topic(
    topic_in: TopicCreate,
    session: SessionDep,
    current_user: CurrentEditor,
) -> Topic:
    subject = subject_crud.get_subject(
        session=session,
        subject_id=topic_in.subject_id,
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    return topic_crud.create_topic(
        session=session,
        topic_in=topic_in,
    )


@router.post(
    "/bulk",
    response_model=TopicBulkCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_topics(
    request: TopicBulkCreateRequest,
    session: SessionDep,
    current_user: CurrentEditor,
) -> TopicBulkCreateResponse:
    subject = session.get(Subject, request.subject_id)

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    topics = [
        Topic(
            subject_id=request.subject_id,
            name=topic.name,
            description=topic.description,
            cognitive_levels=topic.cognitive_levels,
            mcq_focus=topic.mcq_focus,
            key_areas=topic.key_areas,
        )
        for topic in request.topics
    ]

    session.add_all(topics)
    session.commit()

    for topic in topics:
        session.refresh(topic)

    return TopicBulkCreateResponse(
        topics=topics,
    )


@router.post(
    "/generate",
    response_model=TopicGenerationResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_topics(
    request: TopicGenerationRequest,
    session: SessionDep,
    current_user: CurrentEditor,
) -> TopicGenerationResponse:
    service = TopicGenerationService()

    return await service.generate(
        session=session,
        request=request,
    )


@router.patch(
    "/{topic_id}",
    response_model=TopicPublic,
)
def update_topic(
    topic_id: uuid.UUID,
    topic_in: TopicUpdate,
    session: SessionDep,
    current_user: CurrentEditor,
) -> Topic:
    topic = topic_crud.get_topic(
        session=session,
        topic_id=topic_id,
    )

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )

    if topic_in.subject_id is not None:
        subject = subject_crud.get_subject(
            session=session,
            subject_id=topic_in.subject_id,
        )

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found",
            )

    return topic_crud.update_topic(
        session=session,
        db_topic=topic,
        topic_in=topic_in,
    )


@router.delete(
    "/{topic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_topic(
    topic_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentEditor,
) -> None:
    topic = topic_crud.get_topic(
        session=session,
        topic_id=topic_id,
    )

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )

    topic_crud.delete_topic(
        session=session,
        db_topic=topic,
    )
