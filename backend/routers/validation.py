from typing import Annotated
from fastapi import APIRouter, Depends, Security, Request, status
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from token_handler import TokenHandler, TokenInfo
from core.database.engine import get_async_session
from core.database.models import Datum, User
from config import Config


router: APIRouter = APIRouter(
    prefix="/validation", dependencies=[Security(TokenHandler.verify_access_token)]
)


@router.get("")
async def data_validate(
    request: Request,
):
    # return templates.TemplateResponse(name="validation.html", request=request)
    with open(Config.HTML_DIR / "validation.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@router.post("/valid", response_class=JSONResponse, response_model=None)
async def valid_check(
    datum_id: str,
    valid: bool,
    speaking_type: str,
    gender: str,
    age: str,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    stmt = (
        update(Datum)
        .where(Datum.id == datum_id)
        .values(valid=valid, type=speaking_type, gender=gender, age=age)
    )
    await session.execute(stmt)
    print("Data validated!")
    user_id = (
        await session.scalars(select(Datum.user_id).where(Datum.id == datum_id))
    ).one()
    return JSONResponse(content={"user_id": user_id}, status_code=status.HTTP_200_OK)
