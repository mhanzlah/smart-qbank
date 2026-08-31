import uuid

from sqlmodel import Session, select

from app.models.topic import Topic
from app.schemas.topic import TopicCreate, TopicUpdate


def get_topic(
    session: Session,
    topic_id: uuid.UUID,
) -> Topic | None:
    return session.get(Topic, topic_id)


def get_topics(
    session: Session,
    *,
    subject_id: uuid.UUID | None = None,
) -> list[Topic]:
    statement = select(Topic)

    if subject_id:
        statement = statement.where(Topic.subject_id == subject_id)

    statement = statement.order_by(Topic.name)

    return list(session.exec(statement).all())


def create_topic(
    session: Session,
    *,
    topic_in: TopicCreate,
) -> Topic:
    topic = Topic.model_validate(topic_in)

    session.add(topic)
    session.commit()
    session.refresh(topic)

    return topic


def update_topic(
    session: Session,
    *,
    db_topic: Topic,
    topic_in: TopicUpdate,
) -> Topic:
    update_data = topic_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_topic, field, value)

    session.add(db_topic)
    session.commit()
    session.refresh(db_topic)

    return db_topic


def delete_topic(
    session: Session,
    *,
    db_topic: Topic,
) -> None:
    session.delete(db_topic)
    session.commit()
