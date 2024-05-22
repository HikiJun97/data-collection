import numpy as np
from pathlib import Path
from typing import Tuple, Sequence
from Time import Time
from Validator import Validator
import cv2


def get_ydl_options(download_path: Path, temp_path: Path) -> dict:
    return {
        "continuedl": False,
        # "format": "bestvideo+bestaudio",
        "paths": {
            "temp": str(temp_path),
            "home": str(download_path),
        },  # yt-dlp cannot handle PosixPath object
        "outtmpl": "%(id)s.%(ext)s",
        # "postprocessor_args": {"ffmpeg": ["-ss", start_time, "-to", end_time]},
        "overwrites": False,
    }


def get_face_coordinates(
    frame: np.ndarray, video_width: int, video_height: int
) -> Tuple[int, int, int, int]:

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml"
    )
    faces: Sequence[cv2.typing.Rect] = face_cascade.detectMultiScale(
        frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )
    Validator.validate_face_num(faces)

    x, y, w, h = max(faces, key=lambda item: item[2] * item[3])  # 가장 큰 얼굴 선택

    # Add padding
    padding_width = int(w * 0.5)
    padding_height = int(h * 0.5)
    x = max(x - padding_width, 0)
    y = max(y - padding_height, 0)
    right = min(x + w + 2 * padding_width, video_width)
    bottom = min(y + h + 2 * padding_height, video_height)
    width = right - x
    height = bottom - y

    return x, y, width, height


def get_time_format(hours: int, minutes: int, seconds: int) -> str:
    return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}"


def get_datum_id(video_url: str, start_time: Time, end_time: Time) -> str:
    vid: str = Validator.validate_url(video_url=video_url)
    return f"{vid} [{start_time} - {end_time}]"


def get_user_name(html_str: str):
    import re

    user_id = ""
    pattern = r"현재 사용자: (\w+) /"
    match = re.search(pattern, html_str)
    if match:
        user_id = match.group(1)

        return user_id
    raise Exception("ID not found")


"""
def get_total_time(user_id: str):
    from database.crud import select_data_from_user
    data = select_data_from_user(user_id=user_id)
    total_time = Time(0, 0, 0)
    for datum in data:
        total_time += Time(datum.end_time) - Time(datum.start_time)

    return total_time
"""
