import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from dotenv import load_dotenv

load_dotenv()


class Config:
    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_PORT = os.getenv("DB_PORT")
    DATABASE = os.getenv("DATABASE")


DATABASE_URL = f"mysql+aiomysql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DATABASE}"
print("DATABASE_URL:", DATABASE_URL)
async_engine = create_async_engine(DATABASE_URL, echo=False)

async_session = async_sessionmaker(
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
    bind=async_engine,
    class_=AsyncSession,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session.begin() as session:
        yield session
