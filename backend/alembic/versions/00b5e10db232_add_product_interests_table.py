"""add product_interests table

Revision ID: 00b5e10db232
Revises: d2db28726aeb
Create Date: 2026-08-08 00:00:00.000000

NOTE: written by hand rather than via `alembic revision --autogenerate`,
since the environment that authored this migration doesn't have network
access to the live Neon database. It's hand-matched to
models/interest.py — after running `alembic upgrade head`, it's worth
running `alembic revision --autogenerate -m "check drift"` once to confirm
this migration and the model agree (should generate an empty file).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '00b5e10db232'
down_revision: Union[str, None] = 'd2db28726aeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    interest_status_enum = sa.Enum(
        "pending", "contacted", "closed",
        name="interest_status_enum",
    )

    op.create_table(
        "product_interests",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("buyer_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", interest_status_enum, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("product_id", "buyer_id", name="uq_product_buyer_interest"),
    )
    op.create_index(
        op.f("ix_product_interests_id"), "product_interests", ["id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_product_interests_id"), table_name="product_interests")
    op.drop_table("product_interests")
    # Postgres ENUM types live independently of the table that used them —
    # must be dropped explicitly or downgrade won't fully undo upgrade().
    sa.Enum(name="interest_status_enum").drop(op.get_bind(), checkfirst=True)
