import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentEditor, CurrentUser, SessionDep
from app.crud import question as question_crud
from app.models.question import Question
from app.schemas.question import (
    QuestionCreate,
    QuestionGenerationRequest,
    QuestionGenerationResponse,
    QuestionPublic,
    QuestionReview,
    QuestionUpdate,
)
from app.services.question_generation import QuestionGenerationService

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)


@router.get(
    "/",
    response_model=list[QuestionPublic],
)
def read_questions(
    session: SessionDep,
    current_user: CurrentUser,
    topic_ids: list[uuid.UUID] | None = None,
) -> list[QuestionPublic]:
    return question_crud.get_questions(
        session=session,
        topic_ids=topic_ids,
    )


@router.get(
    "/review",
    response_model=list[QuestionPublic],
)
def read_questions_for_review(
    session: SessionDep,
    current_user: CurrentEditor,
) -> list[QuestionPublic]:
    return question_crud.get_questions_for_review(
        session=session,
    )


@router.get(
    "/{question_id}",
    response_model=QuestionPublic,
)
def read_question(
    question_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Question:
    question = question_crud.get_question(
        session=session,
        question_id=question_id,
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    return question


# --------------------------------------------------------------------------
# Create single question
# --------------------------------------------------------------------------


@router.post(
    "/",
    response_model=QuestionPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    question_in: QuestionCreate,
    session: SessionDep,
    current_user: CurrentEditor,
) -> Question:
    return question_crud.create_question(
        session=session,
        question_in=question_in,
    )


# --------------------------------------------------------------------------
# Generate questions
# --------------------------------------------------------------------------


@router.post(
    "/generate",
    response_model=QuestionGenerationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_questions(
    request: QuestionGenerationRequest,
    session: SessionDep,
    # current_user: CurrentEditor,
) -> QuestionGenerationResponse:
    service = QuestionGenerationService()

    return await service.generate(
        session=session,
        request=request,
    )


# --------------------------------------------------------------------------
# Update question
# --------------------------------------------------------------------------


@router.patch(
    "/{question_id}",
    response_model=QuestionPublic,
)
def update_question(
    question_id: uuid.UUID,
    question_in: QuestionUpdate,
    session: SessionDep,
    current_user: CurrentEditor,
) -> Question:
    question = question_crud.get_question(
        session=session,
        question_id=question_id,
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    return question_crud.update_question(
        session=session,
        db_question=question,
        question_in=question_in,
    )


# --------------------------------------------------------------------------
# Review question
# --------------------------------------------------------------------------


@router.patch(
    "/{question_id}/review",
    response_model=QuestionPublic,
)
def review_question(
    question_id: uuid.UUID,
    review_in: QuestionReview,
    session: SessionDep,
    current_user: CurrentEditor,
) -> Question:
    question = question_crud.get_question(
        session=session,
        question_id=question_id,
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    return question_crud.review_question(
        session=session,
        db_question=question,
        review_in=review_in,
    )


# --------------------------------------------------------------------------
# Delete question
# --------------------------------------------------------------------------


@router.delete(
    "/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_question(
    question_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentEditor,
) -> None:
    question = question_crud.get_question(
        session=session,
        question_id=question_id,
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    question_crud.delete_question(
        session=session,
        db_question=question,
    )
