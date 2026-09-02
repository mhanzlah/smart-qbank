import uuid

from sqlmodel import Session, select

from app.models import Question, Topic
from app.schemas.question import (
    QuestionCreate,
    QuestionReview,
    QuestionReviewStatus,
    QuestionUpdate,
)


def get_question(
    session: Session,
    question_id: uuid.UUID,
) -> Question | None:
    return session.get(Question, question_id)


def get_questions(
    session: Session,
    topic_ids: list[uuid.UUID] | None = None,
) -> list[Question]:
    statement = (
        select(Question)
        .where(Question.review_status == "approved")
        .order_by(Question.created_at.desc())
    )

    if topic_ids:
        statement = statement.where(Question.topic_id.in_(topic_ids))

    return list(session.exec(statement).all())


def get_questions_for_review(
    session: Session,
    subject_id: uuid.UUID | None = None,
    topic_id: uuid.UUID | None = None,
) -> list[Question]:
    statement = (
        select(Question)
        .join(Topic)
        .where(Question.review_status == QuestionReviewStatus.pending)
    )

    if subject_id:
        statement = statement.where(Topic.subject_id == subject_id)

    if topic_id:
        statement = statement.where(Question.topic_id == topic_id)

    return list(session.exec(statement).all())


def create_question(
    session: Session,
    question_in: QuestionCreate,
) -> Question:
    question = Question(
        **question_in.model_dump(),
        is_validated=False,
        review_status="pending",
    )

    session.add(question)
    session.commit()
    session.refresh(question)

    return question


def update_question(
    session: Session,
    db_question: Question,
    question_in: QuestionUpdate,
) -> Question:
    update_data = question_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_question, field, value)

    db_question.is_validated = False
    db_question.review_status = "pending"

    session.add(db_question)
    session.commit()
    session.refresh(db_question)

    return db_question


def review_question(
    session: Session,
    db_question: Question,
    review_in: QuestionReview,
) -> Question:
    db_question.review_status = review_in.review_status

    db_question.is_validated = review_in.review_status.value == "approved"

    session.add(db_question)
    session.commit()
    session.refresh(db_question)

    return db_question


def delete_question(
    session: Session,
    db_question: Question,
) -> None:
    session.delete(db_question)
    session.commit()
