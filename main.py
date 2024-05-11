from pathlib import Path
from typing import Annotated
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
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from datetime import timedelta
from token_handler import TokenHandler
from exceptions import UnregisteredUserError

app = FastAPI()

SRC = "src"
HTML_DIR = "."
app.mount("/" + SRC, StaticFiles(directory=HTML_DIR + "/" + SRC), name=SRC)
app.mount(
    "/node_modules",
    StaticFiles(directory=HTML_DIR + "/" + "node_modules"),
    name="node_modules",
)
templates = Jinja2Templates(directory=HTML_DIR)

REFRESH_TOKEN_EXPIRES = timedelta(days=1)
ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
USER = "sgn04088"
PASSWORD = "whgudwns1997"


class LoginRequest(BaseModel):
    userId: str
    userPw: str
    remember: bool = Field(default=False)


def validate_user(login_request: LoginRequest):
    if login_request.userId != USER:
        raise UnregisteredUserError
    if login_request.userPw != PASSWORD:
        raise UnregisteredUserError
    return login_request


temp_user_db = {
    "sgn04088": {
        "name": "조형준",
        "id": "sgn04088",
        "password": "whgudwns1997",
        "role": "admin",
    }
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse(name="index.html", request=request)


# return RedirectResponse("/login")


@app.get("/value")
async def get_value():
    return {"value": "It's FastAPI!"}


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(name="login.html", request=request)


@app.post("/login")
async def login(login_request: Annotated[LoginRequest, Depends(validate_user)]):

    print(f"login_request: {login_request}")
    refresh_token = TokenHandler.create_token(
        sub=login_request.userId, expires_delta=REFRESH_TOKEN_EXPIRES
    )
    access_token = TokenHandler.create_token(
        sub=login_request.userId, expires_delta=ACCESS_TOKEN_EXPIRES
    )
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
    user: Annotated[str, Depends(TokenHandler.verify_access_token)]
):
    print(user)
    return JSONResponse(content={"user": user}, status_code=status.HTTP_200_OK)


@app.get("/data-collection/face-crop")
async def face_crop(
    request: Request, token_payload: dict = Security(TokenHandler.verify_access_token)
):
    return templates.TemplateResponse(name="index.html", request=request)

    #     with open("dist/index.html", "r") as f:
    #         html_content = f.read()
    #     return HTMLResponse(html_content)


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


# @app.get("/", response_class=HTMLResponse)
# async def main_page(request: Request):
#     return templates.TemplateResponse("index.html", {"request": request})

# @app.get("/readme")
# async def readme():
#     return FileResponse(
#         "src/README.md", media_type="text/markdown", filename="README.md"
#     )


@app.exception_handler(HTTPException)
def auth_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        print(exc.status_code)
        return RedirectResponse(url="/login")
    # return templates.TemplateResponse(name="error.html", request=request)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", host="0.0.0.0", port=8000, reload=True)
