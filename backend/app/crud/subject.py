import uuid

from sqlmodel import Session, select

from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate


def create_subject(
    *,
    session: Session,
    subject_in: SubjectCreate,
) -> Subject:
    subject = Subject.model_validate(subject_in)

    session.add(subject)
    session.commit()
    session.refresh(subject)

    return subject


def get_subject(
    *,
    session: Session,
    subject_id: uuid.UUID,
) -> Subject | None:
    return session.get(Subject, subject_id)


def get_subjects(
    *,
    session: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[Subject]:
    statement = select(Subject).offset(skip).limit(limit).order_by(Subject.name)

    return list(session.exec(statement).all())


def update_subject(
    *,
    session: Session,
    db_subject: Subject,
    subject_in: SubjectUpdate,
) -> Subject:
    subject_data = subject_in.model_dump(exclude_unset=True)

    db_subject.sqlmodel_update(subject_data)

    session.add(db_subject)
    session.commit()
    session.refresh(db_subject)

    return db_subject


def delete_subject(
    *,
    session: Session,
    db_subject: Subject,
) -> None:
    session.delete(db_subject)
    session.commit()
