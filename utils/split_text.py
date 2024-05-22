import re
from typing import List, Dict


pattern = r"(?P<user_id>\w+): (?P<video_id>[\w-]+) \[(?P<start_time>\d{2}:\d{2}:\d{2}) - (?P<end_time>\d{2}:\d{2}:\d{2})\]"
userlist: List[Dict] = []

with open("datalist.txt", "r") as f:
    for line in f:
        text = line.strip()
        matched_text = re.match(pattern, text)

        if matched_text:
            user_id = matched_text.group("user_id")
            video_id = matched_text.group("video_id")
            start_time = matched_text.group("start_time")
            end_time = matched_text.group("end_time")
            userlist.append(
                {
                    "user_id": user_id,
                    "video_id": video_id,
                    "start_time": start_time,
                    "end_time": end_time,
                }
            )
