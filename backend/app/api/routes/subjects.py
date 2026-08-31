import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentEditor, CurrentUser, SessionDep
from app.crud import subject as subject_crud
from app.schemas.subject import SubjectCreate, SubjectPublic, SubjectUpdate

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"],
)


@router.get(
    "/",
    response_model=list[SubjectPublic],
)
def read_subjects(
    session: SessionDep,
    # current_user: CurrentUser,
) -> list[SubjectPublic]:
    return subject_crud.get_subjects(  # type: ignore
        session=session,
    )


@router.get(
    "/{subject_id}",
    response_model=SubjectPublic,
)
def read_subject(
    subject_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentEditor,
) -> SubjectPublic:

    subject = subject_crud.get_subject(
        session=session,
        subject_id=subject_id,
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    return subject  # type: ignore


@router.post(
    "/",
    response_model=SubjectPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_subject(
    subject_in: SubjectCreate,
    session: SessionDep,
    current_user: CurrentEditor,
) -> SubjectPublic:

    return subject_crud.create_subject(  # type: ignore
        session=session,
        subject_in=subject_in,
    )


@router.patch(
    "/{subject_id}",
    response_model=SubjectPublic,
)
def update_subject(
    subject_id: uuid.UUID,
    subject_in: SubjectUpdate,
    session: SessionDep,
    current_user: CurrentEditor,
) -> SubjectPublic:

    subject = subject_crud.get_subject(
        session=session,
        subject_id=subject_id,
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    return subject_crud.update_subject(  # type: ignore
        session=session,
        db_subject=subject,
        subject_in=subject_in,
    )


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_subject(
    subject_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentEditor,
) -> None:

    subject = subject_crud.get_subject(
        session=session,
        subject_id=subject_id,
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    subject_crud.delete_subject(
        session=session,
        db_subject=subject,
    )
