
import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine


load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./student_survey.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    DATABASE_URL,
    echo=True,
    connect_args=connect_args
)
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)