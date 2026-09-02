import time
import uuid

from fastapi import APIRouter, HTTPException, Query, status

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
    _: CurrentEditor,
    topic_ids: list[uuid.UUID] | None = Query(default=None),
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
    _: CurrentEditor,
    subject_id: uuid.UUID | None = None,
    topic_id: uuid.UUID | None = None,
) -> list[QuestionPublic]:
    return question_crud.get_questions_for_review(
        session=session,
        subject_id=subject_id,
        topic_id=topic_id,
    )


@router.get(
    "/{question_id}",
    response_model=QuestionPublic,
)
def read_question(
    question_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUser,
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


@router.post(
    "/",
    response_model=QuestionPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    question_in: QuestionCreate,
    session: SessionDep,
    _: CurrentEditor,
) -> Question:
    return question_crud.create_question(
        session=session,
        question_in=question_in,
    )


@router.post(
    "/generate",
    response_model=QuestionGenerationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_questions(
    request: QuestionGenerationRequest,
    session: SessionDep,
    _: CurrentEditor,
) -> QuestionGenerationResponse:
    start_time = time.perf_counter()

    service = QuestionGenerationService()
    all_questions: list[Question] = []

    for topic_id in request.topic_ids:
        generated_questions = await service.generate(
            session=session,
            topic_id=topic_id,
            difficulty_distribution=request.difficulty_distribution,
        )

        for generated in generated_questions:
            question = Question(
                question=generated.question,
                options=[
                    generated.options["A"],
                    generated.options["B"],
                    generated.options["C"],
                    generated.options["D"],
                    generated.options["E"],
                ],
                correct_option=generated.correct_option,
                difficulty=generated.difficulty,
                cognitive_level=generated.cognitive_level,
                explanation=generated.explanation,
                topic_id=topic_id,
                is_validated=True,
            )

            all_questions.append(question)

    session.add_all(all_questions)
    session.commit()

    for question in all_questions:
        session.refresh(question)

    generation_time = time.perf_counter() - start_time

    return QuestionGenerationResponse(
        questions=all_questions,
        total_generated=len(all_questions),
        generation_time=round(generation_time, 2),
    )


@router.patch(
    "/{question_id}",
    response_model=QuestionPublic,
)
def update_question(
    question_id: uuid.UUID,
    question_in: QuestionUpdate,
    session: SessionDep,
    _: CurrentEditor,
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


@router.patch(
    "/{question_id}/review",
    response_model=QuestionPublic,
)
def review_question(
    question_id: uuid.UUID,
    review_in: QuestionReview,
    session: SessionDep,
    _: CurrentEditor,
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


@router.delete(
    "/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_question(
    question_id: uuid.UUID,
    session: SessionDep,
    _: CurrentEditor,
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
