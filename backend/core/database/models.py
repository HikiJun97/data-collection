from typing import List
from sqlalchemy import (
    String,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(30), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(30), nullable=False)
    password: Mapped[str] = mapped_column(String(30), nullable=False)
    type: Mapped[str] = mapped_column(
        String(20), nullable=True, default="user")
    data: Mapped[List["Datum"]] = relationship("Datum", back_populates="user")


class Video(Base):
    __tablename__ = "videos"
    id: Mapped[str] = mapped_column(
        String(13), nullable=False, primary_key=True, index=True
    )
    data: Mapped[List["Datum"]] = relationship("Datum", back_populates="video")


class Datum(Base):
    __tablename__ = "data"
    id: Mapped[str] = mapped_column(
        String(35), nullable=False, primary_key=True, index=True
    )
    user_id: Mapped[str] = mapped_column(String(30), ForeignKey("users.id"))
    user: Mapped["User"] = relationship("User", back_populates="data")
    video_id: Mapped[str] = mapped_column(String(13), ForeignKey("videos.id"))
    video: Mapped["Video"] = relationship("Video", back_populates="data")
    start_time: Mapped[str] = mapped_column(String(8), nullable=False)
    end_time: Mapped[str] = mapped_column(String(8), nullable=False)
    valid: Mapped[bool] = mapped_column(Boolean, nullable=True)
    validated: Mapped[bool] = mapped_column(Boolean, nullable=True)
    validator: Mapped[str] = mapped_column(String(20), nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=True)
    gender: Mapped[str] = mapped_column(String(10), nullable=True)
    age: Mapped[str] = mapped_column(String(20), nullable=True)
