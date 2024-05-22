import re
from config import Config
from typing import Set

from Time import Time
from exceptions import ValidationError


class Validator:
    @classmethod
    def validate_input(cls, video_url: str, start_time: Time, end_time: Time):
        cls.validate_url(video_url)
        cls.validate_none({video_url})
        cls.validate_time(start_time, end_time)

    @classmethod
    def validate_url(cls, video_url: str):
        pattern: str = r"(?:v=|youtu\.be/|youtube\.com/shorts/)([\w-]+)(?:&|$)"
        pattern_regular: str = r"(?:v=|youtu\.be/)([\w-]+)"
        pattern_shorts: str = r"youtube\.com/shorts/([\w-]+)"

        if "shorts" in video_url:
            match = re.search(pattern_shorts, video_url)
        else:
            match = re.search(pattern_regular, video_url)

        # 각 URL에서 영상 ID 추출
        if not match:
            raise ValidationError("영상을 찾을 수가 없습니다.")
        return match.group(1)

    @classmethod
    def validate_none(cls, input: Set):
        if None in input:
            raise ValidationError("빈 입력값을 채워주세요.")

    @classmethod
    def validate_time(cls, start_time: Time, end_time: Time):
        try:
            if end_time - start_time < Time.from_seconds(Config.MINIMUM_LENGTH):
                raise ValidationError(
                    "학습 데이터의 최소 요구 시간보다 구간이 짧습니다."
                )
        except ValueError as e:
            raise ValidationError("종료 시간이 시작 시간보다 앞섭니다.")

    @classmethod
    def validate_info_dict(cls, info_dict: dict | None):
        if info_dict is None:
            raise ValidationError("Cannot extract metadata from video")

    @classmethod
    def validate_face_num(cls, faces):
        if len(faces) == 0:
            raise ValidationError("인식된 얼굴이 없습니다.")
        if len(faces) > 1:
            raise ValidationError("두 명 이상의 얼굴이 인식됩니다.")
