import os
from sqlalchemy import select, create_engine
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

from core.database.models import Datum, User

load_dotenv()


class Config:
    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_PORT = os.getenv("DB_PORT")
    DATABASE = os.getenv("DATABASE")


DATABASE_URL = f"mysql+pymysql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DATABASE}"
print("DATABASE_URL:", DATABASE_URL)
engine = create_engine(DATABASE_URL, echo=False)
session = sessionmaker(bind=engine)


def get_data_list():
    with session.begin() as conn:
        stmt = select(Datum)
        results = conn.execute(stmt).scalars().all()

        with open("datalist.txt", "w") as f:
            for datum in results:
                f.write(f"{datum.user_id}: {datum.id}\n")


get_data_list()
