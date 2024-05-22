import os
import ffmpeg
import yt_dlp
import cv2
import numpy as np
from typing import Tuple, Any
from pathlib import Path

from config import Config
from Time import Time
from CV2VideoCaptureContextManager import CV2VideoCaptureContextManager
from video_processign_utils import get_ydl_options
from FaceDetector import FaceDetector
from Validator import Validator
from exceptions import VideoProcessingError

video_codec = "libx264"
video_format = "mp4"
crf = 18


class VideoProcessor:
    def __init__(self, video_url: str, start_time: Time, end_time: Time):
        Validator.validate_input(video_url, start_time, end_time)
        self.video_url: str = video_url
        self.start_time: Time = start_time
        self.end_time: Time = end_time

    def process(self) -> Path:
        # process flow: download -> trim -> capture -> detect -> add padding -> crop

        downloaded_video_path: Path = self.download_video(
            video_url=self.video_url,
            download_path=Config.DOWNLOADED_VIDEO_PATH,
            temp_path=Config.TEMP_PATH,
        )

        trimmed_video_path: Path = self.trim_video(
            video_path=downloaded_video_path,
            output_path=Config.TRIMMED_VIDEO_PATH,
            start_time=self.start_time,
            end_time=self.end_time,
        )

        success, frame, video_width, video_height = self.capture_video(
            video_path=trimmed_video_path
        )

        if not success:
            raise VideoProcessingError(
                f"{self.video_url} [{self.start_time} - {self.end_time}]: 영상 처리에 실패하였습니다."
            )

        faces, coordinates = FaceDetector().detect_faces(frame=frame)

        Validator.validate_face_num(faces)

        coordinate = self.add_padding(
            coordinates[0], video_width=video_width, video_height=video_height
        )

        video_input, video_output = self.crop_video(
            video_path=trimmed_video_path, coordinate=coordinate
        )

        output_video_path = self.save_video(
            video_path=trimmed_video_path,
            video_input=video_input,
            video_output=video_output,
        )

        return output_video_path

    def download_video(
        self, download_path: Path, temp_path: Path, video_url: str
    ) -> Path:
        with yt_dlp.YoutubeDL(get_ydl_options(download_path, temp_path)) as ydl:

            # download video and get video metadata
            info_dict: dict | None = ydl.extract_info(
                video_url, download=False)

            if info_dict is None:
                raise VideoProcessingError("info_dict is empty")

            Validator.validate_info_dict(info_dict)
            VID: str | None = info_dict.get("id")
            EXT: str | None = info_dict.get("ext")
            ydl.download([video_url])

            # return file_name
            downloaded_video_path: Path = download_path / f"{VID}.{EXT}"
            print(
                f"------------- VIDEO DOWNLOADED at {downloaded_video_path} -------------"
            )

        return downloaded_video_path

    def trim_video(
        self,
        video_path: Path,
        output_path: Path,
        start_time: Time,
        end_time: Time,
    ) -> Path:
        print("########### TIME RANGE ###########")
        print(f"[ {start_time} - {end_time} ]")
        print("##################################")
        file_name = video_path.as_posix().split("/")[-1]
        VID = file_name.split(".")[0]
        EXT = file_name.split(".")[-1]
        EXT = "mp4"
        # media_info = self.get_media_info(video_path)
        # video_codec = media_info.get("video_codec")
        # audio_codec = media_info.get("audio_codec")
        # video_bitrate = media_info.get("video_bitrate")

        output_video_path = output_path / \
            f"{VID} [{start_time} - {end_time}].{EXT}"

        # ss와 to 옵션을 input, output 중 어디에 두냐에 따라 trim 방식이 달라짐
        ffmpeg.input(video_path.as_posix()).output(
            output_video_path.as_posix(),
            vcodec=video_codec,
            acodec="copy",
            ss=start_time,
            to=end_time,
            # video_bitrate=video_bitrate,
            crf=crf,
        ).run(overwrite_output=True)
        return output_video_path

    def capture_video(self, video_path: Path) -> Tuple[bool, np.ndarray, int, int]:
        """
        TODO: 첫 프레임만 검사하는 현행 방식에서 여러 프레임 검사하는 방식으로 변경
        """
        print(f"------------- PROCESS VIDEO: {video_path} -------------")

        with CV2VideoCaptureContextManager(video_path.as_posix()) as cap:
            if not cap.isOpened():
                raise ValueError("Video cannot be opened.")

            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            video_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            video_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            frame_index = 0

            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
            success, frame = cap.read()
            print(
                f"total_frames: {total_frames}, fps: {fps}, frame_index: {frame_index}, video_width: {video_width}, video_height: {video_height}, {success}"
            )
        return success, frame, video_width, video_height

    def crop_video(
        self,
        video_path: Path,
        coordinate: Tuple,
        # ) -> Path:
    ) -> Tuple[Any, Any]:
        print("------------------ Let's CROP!!! ------------------")
        try:
            x, y, w, h = coordinate
            video_input = ffmpeg.input(video_path.as_posix())
            video_output = video_input.video.crop(x=x, y=y, width=w, height=h).filter(
                "scale", 512, 512
            )

            return video_input, video_output
        except ffmpeg.Error as e:
            raise VideoProcessingError(f"ffmpeg error: {e.stderr}")
        except Exception as e:
            print("An error occurred", str(e))
            raise VideoProcessingError(e.__repr__())

    def save_video(self, video_path: Path, video_input, video_output) -> Path:
        print("------------------ Let's SAVE!!! ------------------")
        cropped_video_path: Path = (
            Config.CROPPED_VIDEO_PATH / video_path.as_posix().split("/")[-1]
        )
        try:
            # video_format, audio_stream, video_codec, audio_codec = (
            media_info: dict = self.get_media_info(video_path)
            # video_format = media_info.get("video_format")
            audio_stream = media_info.get("audio_stream")
            # video_codec = media_info.get("video_codec")
            # audio_codec = media_info.get("audio_codec")
            # video_bitrate = media_info.get("video_bitrate")

            if audio_stream:
                audio_output = video_input.audio
                output = ffmpeg.output(
                    video_output,
                    audio_output,
                    cropped_video_path.as_posix(),
                    format=video_format,
                    vcodec=video_codec,
                    # acodec=audio_codec,
                    acodec="copy",
                )
            else:
                output = ffmpeg.output(
                    video_output,
                    cropped_video_path.as_posix(),
                    format=video_format,
                    vcodec=video_codec,
                )

            ffmpeg.run(output, overwrite_output=True)

            if not os.path.exists(cropped_video_path):
                raise Exception("There's no Output Video File.")

            print("Video processing completed successfully.")
        except ffmpeg.Error as e:
            print("ffmpeg error:", e.stderr)
            raise VideoProcessingError(str(e))
        except Exception as e:
            print("An error occurred", str(e))
            raise VideoProcessingError(str(e))
        finally:
            return cropped_video_path

    def add_padding(self, coordinate, video_width, video_height):
        # Add padding
        x, y, w, h = coordinate
        # padding_width = int(w * 0.5)
        # padding_height = int(h * 0.5)
        # new_x = max(x - padding_width, 0)
        # new_y = max(y - padding_height, 0)
        # right = min(new_x + w + 2 * padding_width, video_width)
        # bottom = min(new_y + h + 2 * padding_height, video_height)

        side = max(2 * w, 2 * h)
        if min(side, video_height, video_width) != side:
            raise VideoProcessingError("얼굴이 영상에서 차지하는 비중이 너무 큽니다.")
        new_x = x - int((side - w) / 2)
        new_y = y - int((side - h) / 2)

        # width = right - new_x
        # height = bottom - new_y

        width = side
        height = side

        return new_x, new_y, width, height

    def get_media_info(self, video_path: Path):
        try:
            probe = ffmpeg.probe(video_path.as_posix())
            video_stream = next(
                (
                    stream
                    for stream in probe["streams"]
                    if stream["codec_type"] == "video"
                ),
                None,
            )
            audio_stream = next(
                (
                    stream
                    for stream in probe["streams"]
                    if stream["codec_type"] == "audio"
                ),
                None,
            )

            video_format = video_path.as_posix().split(".")[-1]
            video_format = Config.codecs_and_formats.get(
                video_format, video_format)
            video_codec = Config.codecs_and_formats.get(
                video_stream["codec_name"] if video_stream else None
            )
            audio_codec = str(
                Config.codecs_and_formats.get(
                    audio_stream["codec_name"] if audio_stream else None
                )
            )
            video_bitrate = (
                video_stream["bit_rate"]
                if video_stream and "bit_rate" in video_stream
                else "1000k"
            )  # Default to 1000k if no bitrate found

            print("-------------- FORMAT --------------")
            print("video_format:", video_format)
            print("video_codec:", video_codec)
            print("audio_codec:", audio_codec)
            print("------------------------------------")

            return {
                "video_format": video_format,
                "audio_stream": audio_stream,
                "video_codec": video_codec,
                "audio_codec": audio_codec,
                "video_bitrate": video_bitrate,
            }
        except ffmpeg.Error as e:
            print("ffmpeg error:", e.stderr)
            raise VideoProcessingError(f"ffmpeg error: {e.stderr}")
