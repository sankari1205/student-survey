

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from app.database import create_db_and_tables, get_session
from app.models import Survey, SurveyCreate, SurveyRead, SurveyUpdate
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Student Survey Backend", version="1.0.0")


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Student Survey Backend is running"}


@app.post("/surveys", response_model=SurveyRead, status_code=201)
def create_survey(survey_data: SurveyCreate):
    with get_session() as session:
        survey = Survey.model_validate(survey_data)
        session.add(survey)
        session.commit()
        session.refresh(survey)
        return survey


@app.get("/surveys", response_model=list[SurveyRead])
def get_all_surveys():
    with get_session() as session:
        surveys = session.exec(select(Survey)).all()
        return surveys


@app.get("/surveys/{survey_id}", response_model=SurveyRead)
def get_survey_by_id(survey_id: int):
    with get_session() as session:
        survey = session.get(Survey, survey_id)
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        return survey


@app.put("/surveys/{survey_id}", response_model=SurveyRead)
def update_survey(survey_id: int, survey_update: SurveyUpdate):
    with get_session() as session:
        survey = session.get(Survey, survey_id)
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")

        update_data = survey_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(survey, key, value)

        session.add(survey)
        session.commit()
        session.refresh(survey)
        return survey


@app.delete("/surveys/{survey_id}")
def delete_survey(survey_id: int):
    with get_session() as session:
        survey = session.get(Survey, survey_id)
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")

        session.delete(survey)
        session.commit()
        return {"message": f"Survey with id {survey_id} deleted successfully"}