import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum
from sqlmodel import Field

from app.schemas.user import UserBase, UserRole
from app.utils import get_datetime_utc


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    role: UserRole = Field(
        default=UserRole.USER,
        sa_type=SAEnum(
            UserRole,
            name="userrole",
            values_callable=lambda enum: [member.value for member in enum],
        ),
    )
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
