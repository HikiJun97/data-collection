from pathlib import Path
from config import Config
from Time import Time


class Video:
    def __init__(self, user_id, video_id, start_time, end_time, status, error_reason):
        self.user_id: str = user_id
        self.video_id: str = video_id
        self.start_time: Time = Time(start_time)
        self.end_time: Time = Time(end_time)
        self.status: str = status
        self.error_reason: str | None = error_reason
        self.downloaded_video: Path = Config.DOWNLOADED_VIDEO_PATH / f"{video_id}.webm"
        self.trimmed_video: Path = Config.TRIMMED_VIDEO_PATH / str(self)
        self.cropped_video: Path = Config.CROPPED_VIDEO_PATH / str(self)

    def remove_video_file(self) -> None:
        if self.downloaded_video.exists():
            self.downloaded_video.unlink(missing_ok=True)
        if self.trimmed_video.exists():
            self.trimmed_video.unlink(missing_ok=True)
        if self.cropped_video.exists():
            self.cropped_video.unlink(missing_ok=True)

    def __repr__(self) -> str:
        return f"({self.user_id}){{{self.video_id}}}[{self.start_time}-{self.end_time}].mp4"

    def print_info(self):
        print(self)
        print(self.downloaded_video)
        print(self.trimmed_video)
        print(self.cropped_video)
