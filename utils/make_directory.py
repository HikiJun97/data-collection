import os
from typing import List
from pathlib import Path

userlist: list = []
with open("userlist.txt", "r", encoding="utf-8") as f:
    for line in f:
        userlist.append(line.strip())

print(userlist)


def create_directories_from_lines(users: List[str], base_path: Path):
    for user in users:
        dir_path = base_path / user
        os.makedirs(dir_path / "downloaded_videos", exist_ok=True)
        os.makedirs(dir_path / "trimmed_videos", exist_ok=True)
        os.makedirs(dir_path / "cropped_videos", exist_ok=True)


create_directories_from_lines(userlist, Path.home() / Path("/video-data"))
