from pathlib import Path
from typing import Annotated, List, Dict, Any
from fastapi import (
    FastAPI,
    Request,
    Response,
    Form,
    Query,
    Depends,
    Security,
    HTTPException,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete
from sqlalchemy.orm import joinedload

from core.database.engine import get_async_session
from core.database.models import User, Video, Datum
from routers.validation import router as validation_router
from schemas import LoginRequest
from datetime import timedelta
from token_handler import TokenHandler, TokenInfo
from exceptions import UnregisteredUserError
from config import Config

app = FastAPI()

SRC = Config.SRC
HTML_DIR = Config.HTML_DIR
app.mount("/" + SRC, StaticFiles(directory=HTML_DIR + "/" + SRC), name=SRC)
# app.mount(
#     "/node_modules",
#     StaticFiles(directory=HTML_DIR + "/" + "node_modules"),
#     name="node_modules",
# )
app.include_router(validation_router)
USER = "sgn04088"
PASSWORD = "whgudwns1997"


def validate_user(login_request: LoginRequest):
    if login_request.userId != USER:
        raise UnregisteredUserError
    if login_request.userPw != PASSWORD:
        raise UnregisteredUserError
    return login_request


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root(
    request: Request,
    token_info: Annotated[TokenInfo, Security(TokenHandler.verify_access_token)],
):
    access_token = (
        f"{token_info.access_token.scheme} {token_info.access_token.credentials}"
    )
    return RedirectResponse(
        url="/intermediate",
        headers={"Authorization": access_token},
    )


@app.get("/value")
async def get_value():
    return {"value": "It's FastAPI!"}


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    # return templates.TemplateResponse(name="login.html", request=request)
    with open(HTML_DIR + "/login.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@app.post("/login")
async def login(login_request: Annotated[LoginRequest, Depends(validate_user)]):
    refresh_token = TokenHandler.create_refresh_token(sub=login_request.userId)
    access_token = TokenHandler.create_access_token(sub=login_request.userId)
    response = JSONResponse(
        content={"accessToken": access_token}, status_code=status.HTTP_200_OK
    )
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        samesite="strict",
        path="/",
    )  # set secure after domain attached
    return response


@app.get("/verification")
async def verify_access_token(
    token_info: Annotated[TokenInfo, Depends(TokenHandler.verify_access_token)]
):
    print(token_info.username)
    return JSONResponse(
        content={"username": token_info.username}, status_code=status.HTTP_200_OK
    )


@app.get("/index")
async def user_type(request: Request):
    # return templates.TemplateResponse(name="index.html", request=request)
    with open(HTML_DIR + "/index.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@app.get("/intermediate")
async def intermediate(request: Request):
    # return templates.TemplateResponse(name="intermediate.html", request=request)
    with open(HTML_DIR + "/intermediate.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@app.get("/data-collection")
async def face_crop(
    request: Request,
    token_payload: TokenInfo = Security(TokenHandler.verify_access_token),
):
    print("redirected to /data-collection")
    # return templates.TemplateResponse(
    #     name="face-crop.html",
    #     request=request,
    # )
    with open(HTML_DIR + "/face-crop.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@app.get("/users")
async def get_users_and_data(
    session: Annotated[AsyncSession, Depends(get_async_session)],
    token_payload: TokenInfo = Security(TokenHandler.verify_access_token),
):
    query = select(User).options(joinedload(User.data))
    query_result = (await session.scalars(query)).unique().all()
    results: List[Dict[str, Any]] = [
        {
            "id": user.id,
            "data": [
                {
                    "id": datum.id,
                    "video_id": datum.video_id,
                    "start_time": datum.start_time,
                    "end_time": datum.end_time,
                    "valid": datum.valid,
                    "validated": datum.validated,
                    "validator": datum.validator,
                }
                for datum in user.data
            ],
        }
        for user in query_result
    ]
    return results


@app.post("/check-video")
async def check_video(request: Request):
    return {"msg": "video check success"}


@app.get("/cropped_videos/", response_class=FileResponse)
async def get_video(
    video_id: Annotated[str, Query(min_length=11, max_length=11)],
    start: Annotated[str, Query(min_length=5, max_length=6)],
    end: Annotated[str, Query(min_length=5, max_length=6)],
):
    start_time: str = (
        f"{int(start[0:-4]):02d}:{int(start[-4:-2]):02d}:{int(start[-2:]):02d}"
    )

    end_time: str = (
        f"{int(end[0:-4]): 02d}: {int(end[-4:-2]): 02d}: {int(end[-2:]): 02d}"
    )
    EXT = "mp4"

    ROOT_PATH: Path = Path(
        "/Users/sgn04088/face-crop-data-collection/src/collection/cropped_videos"
    )
    file_name = f"{video_id} [{start_time} - {end_time}].{EXT}"

    return FileResponse(path=ROOT_PATH / file_name)


@app.exception_handler(HTTPException)
def auth_exception_handler(request: Request, exc: HTTPException):
    import traceback

    if exc.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        print(traceback.format_exc(), exc)
        return RedirectResponse(url="/intermediate")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main2:app", host="0.0.0.0", port=8000, reload=True)
