
from typing import List, Optional
from datetime import date
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from pydantic import EmailStr, field_validator


ALLOWED_LIKED_MOST = {
    "students",
    "location",
    "campus",
    "atmosphere",
    "dorm rooms",
    "sports",
}

ALLOWED_INTEREST_SOURCE = {
    "friends",
    "television",
    "internet",
    "other",
}

ALLOWED_RECOMMENDATION = {
    "Very Likely",
    "Likely",
    "Unlikely",
}


class SurveyBase(SQLModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    street_address: str = Field(min_length=1, max_length=200)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=50)
    zip_code: str = Field(min_length=5, max_length=10)
    telephone: str = Field(min_length=10, max_length=15)
    email: EmailStr
    survey_date: date

    liked_most: List[str] = Field(sa_column=Column(JSON))
    interest_source: str = Field(min_length=1, max_length=20)
    recommendation: str = Field(min_length=1, max_length=20)

    @field_validator("telephone")
    @classmethod
    def validate_telephone(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) != 10:
            raise ValueError("Telephone number must contain exactly 10 digits")
        return value

    @field_validator("zip_code")
    @classmethod
    def validate_zip_code(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) not in (5, 9):
            raise ValueError("ZIP code must contain 5 or 9 digits")
        return value

    @field_validator("liked_most")
    @classmethod
    def validate_liked_most(cls, value: List[str]) -> List[str]:
        if not value:
            raise ValueError("At least one 'liked most' option must be selected")

        invalid = [item for item in value if item not in ALLOWED_LIKED_MOST]
        if invalid:
            raise ValueError(
                f"Invalid liked_most option(s): {invalid}. "
                f"Allowed options are: {sorted(ALLOWED_LIKED_MOST)}"
            )
        return value

    @field_validator("interest_source")
    @classmethod
    def validate_interest_source(cls, value: str) -> str:
        if value.lower() not in ALLOWED_INTEREST_SOURCE:
            raise ValueError(
                f"Invalid interest_source. Allowed options are: {sorted(ALLOWED_INTEREST_SOURCE)}"
            )
        return value.lower()

    @field_validator("recommendation")
    @classmethod
    def validate_recommendation(cls, value: str) -> str:
        if value not in ALLOWED_RECOMMENDATION:
            raise ValueError(
                f"Invalid recommendation. Allowed options are: {sorted(ALLOWED_RECOMMENDATION)}"
            )
        return value


class Survey(SurveyBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class SurveyCreate(SurveyBase):
    pass


class SurveyUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    survey_date: Optional[date] = None
    liked_most: Optional[List[str]] = None
    interest_source: Optional[str] = None
    recommendation: Optional[str] = None


class SurveyRead(SurveyBase):
    id: int