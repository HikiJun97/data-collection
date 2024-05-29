import os
from pathlib import Path
from dotenv import load_dotenv


class Config:
    # frontend directory
    HTML_DIR = Path.home() / "data-collection" / "frontend"
    VIDEO_DIR = Path.home() / "video-data" / "cropped_videos"
    SRC = "src"

    HOST = "0.0.0.0"
    PORT = 8000

    # ROOT_PATH: Path = Path(os.getenv("ROOT", "/workspace/src"))
    # ROOT_PATH: Path = Path("/Users/hikijun/face-crop-data-collection/src")
    ROOT_PATH: Path = Path("/home/sgn04088/data-collection/backend")
    DOWNLOADED_VIDEO_PATH: Path = ROOT_PATH / "downloaded_videos"
    TEMP_PATH: Path = ROOT_PATH / "temp"
    TRIMMED_VIDEO_PATH: Path = ROOT_PATH / "trimmed_videos"
    CROPPED_VIDEO_PATH: Path = ROOT_PATH / "cropped_videos"

    HOUR = 3600
    MINUTE = 60
    SECOND = 1
    MINIMUM_LENGTH = 3 * SECOND

    codecs_and_formats: dict = {
        # format
        "mkv": "matroska",
        # video
        "h264": "libx264",
        "h265": "libx265",
        "vp8": "libvpx-vp8",
        "vp9": "libvpx-vp9",
        "av1": "libaom-av1",
        # audio
        "mp3": "libmp3lame",
        "aac": "libfdk_aac",
        "vorbis": "libvorbis",
        "opus": "libopus",
        "ac3": "ac3",
        "dts": "dca",
    }
