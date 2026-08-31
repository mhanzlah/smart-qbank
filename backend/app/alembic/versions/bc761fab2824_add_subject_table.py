"""add subject table

Revision ID: bc761fab2824
Revises: 972451aa7e59
Create Date: 2026-08-30 18:52:54.780316
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "bc761fab2824"
down_revision = "972451aa7e59"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "subject",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("code", sa.String(), nullable=True),
        sa.Column("clo", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("subject")
