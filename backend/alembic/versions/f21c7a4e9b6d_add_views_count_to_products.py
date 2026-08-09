"""add views_count to products

Revision ID: f21c7a4e9b6d
Revises: 00b5e10db232
Create Date: 2026-08-06 00:00:00.000000

NOTE: written by hand rather than via `alembic revision --autogenerate`,
since this environment doesn't have network access to the live Neon
database. After running `alembic upgrade head`, it's worth running
`alembic revision --autogenerate -m "check drift"` once to confirm this
migration and the model agree (should generate an empty file).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f21c7a4e9b6d'
down_revision: Union[str, None] = '00b5e10db232'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("views_count", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("products", "views_count")
