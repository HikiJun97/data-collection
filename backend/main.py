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
from fastapi.responses import (
    HTMLResponse,
    JSONResponse,
    FileResponse,
    RedirectResponse,
    StreamingResponse,
)
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete
from sqlalchemy.orm import joinedload
from datetime import timedelta

from core.database.engine import get_async_session
from core.database.models import User, Video, Datum
from routers.validation import router as validation_router
from schemas import LoginRequest
from token_handler import TokenHandler, TokenInfo
from exceptions import UnregisteredUserError
from config import Config

app = FastAPI()

SRC: str = Config.SRC
HTML_DIR: Path = Config.HTML_DIR
VIDEO_DIR: Path = Config.VIDEO_DIR
app.mount("/" + SRC, StaticFiles(directory=HTML_DIR / SRC), name=SRC)
app.mount(
    "/node_modules",
    StaticFiles(directory=HTML_DIR / "node_modules"),
    name="node_modules",
)
app.include_router(validation_router)
USER = "sgn04088"
PASSWORD = "whgudwns1997"

templates = Jinja2Templates(directory=HTML_DIR)


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
    # token_info: Annotated[TokenInfo, Security(TokenHandler.verify_access_token)],
):
    return RedirectResponse(
        url="/index",
    )


@app.get("/temp")
async def temp(request: Request):
    return request.headers


@app.get("/login")
async def login_page(
    request: Request,
    # token_info: TokenInfo = Security(TokenHandler.verify_access_token)
):
    return templates.TemplateResponse(name="login.html", request=request)


#     with open(HTML_DIR / "login.html") as f:
#         html_content = f.read()
#     return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@app.post("/login")
async def login(login_request: Annotated[LoginRequest, Security(validate_user)]):
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
async def user_type(
    request: Request,
    token_info: Annotated[TokenInfo, Security(TokenHandler.verify_access_token)],
):
    return templates.TemplateResponse(name="index.html", request=request)


@app.get("/index-content")
async def index_content(
    request: Request,
    token_info: Annotated[TokenInfo, Security(TokenHandler.verify_access_token)],
):
    with open(HTML_DIR / "index.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@app.get("/intermediate")
async def intermediate(request: Request):
    print("Check Headers:", request.headers)
    from_header = request.headers.get("from")
    print("Bypassing intermediate.html... from", from_header)
    context = {"request": request, "from_header": from_header}

    return templates.TemplateResponse(name="intermediate.html", context=context)


@app.get("/header")
async def header(
    request: Request,
    token_info: Annotated[TokenInfo, Security(TokenHandler.verify_access_token)],
):
    return templates.TemplateResponse(name="header.html", request=request)

    #     with open(HTML_DIR / "intermediate.html") as f:
    #         html_content = f.read()
    #     return HTMLResponse(content=html_content, status_code=status.HTTP_200_OK)


@app.get("/face-crop")
async def face_crop(
    request: Request,
    token_payload: TokenInfo = Security(TokenHandler.verify_access_token),
):
    with open(HTML_DIR / "face-crop.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)


@app.get("/users")
async def get_users_and_data(
    session: Annotated[AsyncSession, Depends(get_async_session)],
    token_payload: TokenInfo = Security(TokenHandler.verify_access_token),
):
    query = select(User).options(joinedload(User.data))
    query_result = (await session.scalars(query)).unique().all()
    results: List[Dict[str, str | List[Dict[str, str | bool]]]] = [
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
                    "type": datum.type,
                    "gender": datum.gender,
                    "age": datum.age,
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


@app.get("/video/")
async def get_video(
    user_id: Annotated[str, Query(..., alias="user-id")],
    video_id: Annotated[str, Query(..., alias="video-id")],
    start_time: Annotated[str, Query(..., alias="start-time")],  # HH:mm:SS
    end_time: Annotated[str, Query(..., alias="end-time")],
    token_payload: TokenInfo = Security(TokenHandler.verify_access_token),
):
    # start_time_text: str = start_time.replace(":", "_")
    # end_time_text: str = end_time.replace(":", "_")
    video_file: Path = (
        VIDEO_DIR / f"({user_id}){{{video_id}}}[{start_time}-{end_time}].mp4"
    )

    if not video_file.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    def iterfile():
        with open(video_file, mode="rb") as file_like:
            yield from file_like

    return StreamingResponse(iterfile(), media_type="video/mp4")


@app.exception_handler(HTTPException)
def auth_exception_handler(request: Request, exc: HTTPException):
    import traceback

    if exc.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        print(traceback.format_exc(), exc)
        print("Here is Exception Handler")

        return RedirectResponse(url="/intermediate", headers={"From": request.url.path})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", host="0.0.0.0", port=8000, reload=True)
