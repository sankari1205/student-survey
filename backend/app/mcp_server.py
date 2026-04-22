from fastmcp import FastMCP
from typing import Optional, List
from sqlmodel import select
from app.database import create_db_and_tables, get_session
from app.models import Survey

mcp = FastMCP("Student Survey MCP Server")


@mcp.tool()
def create_survey(
    first_name: str,
    last_name: str,
    street_address: str,
    city: str,
    state: str,
    zip_code: str,
    telephone: str,
    email: str,
    survey_date: str,
    liked_most: List[str],
    interest_source: str,
    recommendation: str
) -> dict:
    """
    Create a new student survey record.
    - liked_most: list of options from [students, location, campus, atmosphere, dorm rooms, sports]
    - interest_source: one of [friends, television, internet, other]
    - recommendation: one of [Very Likely, Likely, Unlikely]
    - survey_date format: YYYY-MM-DD
    """
    try:
        from datetime import date
        survey = Survey(
            first_name=first_name,
            last_name=last_name,
            street_address=street_address,
            city=city,
            state=state,
            zip_code=zip_code,
            telephone=telephone,
            email=email,
            survey_date=date.fromisoformat(survey_date),
            liked_most=liked_most,
            interest_source=interest_source,
            recommendation=recommendation
        )
        with get_session() as session:
            session.add(survey)
            session.commit()
            session.refresh(survey)
            return {"success": True, "survey": survey.model_dump()}
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
def list_surveys() -> dict:
    """Return all student surveys in the database."""
    with get_session() as session:
        surveys = session.exec(select(Survey)).all()
        return {"surveys": [s.model_dump() for s in surveys], "count": len(surveys)}


@mcp.tool()
def get_survey_by_id(survey_id: int) -> dict:
    """Get a single survey by its ID."""
    with get_session() as session:
        survey = session.get(Survey, survey_id)
        if not survey:
            return {"error": f"Survey with id {survey_id} not found"}
        return survey.model_dump()


@mcp.tool()
def search_surveys(
    name: Optional[str] = None,
    city: Optional[str] = None,
    recommendation: Optional[str] = None,
    liked_most: Optional[str] = None,
    interest_source: Optional[str] = None
) -> dict:
    """
    Search surveys by any combination of: name, city, recommendation, liked_most, interest_source.
    All parameters are optional — provide at least one.
    Examples:
    - search by name: name="John Doe"
    - search by what they liked: liked_most="dorm rooms"
    - search by recommendation: recommendation="Likely"
    """
    with get_session() as session:
        surveys = session.exec(select(Survey)).all()
        results = []
        for s in surveys:
            full_name = f"{s.first_name} {s.last_name}".lower()
            if name and name.lower() not in full_name:
                continue
            if city and city.lower() not in s.city.lower():
                continue
            if recommendation and recommendation.lower() not in s.recommendation.lower():
                continue
            if liked_most and liked_most.lower() not in [l.lower() for l in s.liked_most]:
                continue
            if interest_source and interest_source.lower() != s.interest_source.lower():
                continue
            results.append(s.model_dump())
        return {"surveys": results, "count": len(results)}


@mcp.tool()
def update_survey(
    survey_id: int,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    street_address: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    zip_code: Optional[str] = None,
    telephone: Optional[str] = None,
    email: Optional[str] = None,
    survey_date: Optional[str] = None,
    liked_most: Optional[List[str]] = None,
    interest_source: Optional[str] = None,
    recommendation: Optional[str] = None
) -> dict:
    """
    Update an existing survey by ID.
    Only provide fields you want to change.
    """
    try:
        with get_session() as session:
            survey = session.get(Survey, survey_id)
            if not survey:
                return {"error": f"Survey with id {survey_id} not found"}
            updates = {
                "first_name": first_name,
                "last_name": last_name,
                "street_address": street_address,
                "city": city,
                "state": state,
                "zip_code": zip_code,
                "telephone": telephone,
                "email": email,
                "survey_date": survey_date,
                "liked_most": liked_most,
                "interest_source": interest_source,
                "recommendation": recommendation
            }
            for key, value in updates.items():
                if value is not None:
                    setattr(survey, key, value)
            session.add(survey)
            session.commit()
            session.refresh(survey)
            return {"success": True, "survey": survey.model_dump()}
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
def delete_survey(survey_id: int) -> dict:
    """
    Delete a survey by ID.
    Returns confirmation message.
    Always confirm with user before calling this tool.
    """
    with get_session() as session:
        survey = session.get(Survey, survey_id)
        if not survey:
            return {"error": f"Survey with id {survey_id} not found"}
        name = f"{survey.first_name} {survey.last_name}"
        session.delete(survey)
        session.commit()
        return {"success": True, "message": f"Survey for {name} (id: {survey_id}) deleted successfully"}


if __name__ == "__main__":
    create_db_and_tables()
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8001)