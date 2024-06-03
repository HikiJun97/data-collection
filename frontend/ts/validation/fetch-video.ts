function parseVideoString(datumId: string): {
  videoId: string;
  startTime: string;
  endTime: string;
} {
  const regex =
    /([a-zA-Z0-9_-]+) \[(\d{2}:\d{2}:\d{2}) - (\d{2}:\d{2}:\d{2})\]/;
  const match = datumId.match(regex);

  if (!match) {
    throw new Error("Invalid video string format");
  }

  const [_, videoId, startTime, endTime] = match;

  return {
    videoId,
    startTime,
    endTime,
  };
}

export async function fetchVideo(): Promise<void> {
  const userId = (
    document.getElementById("user-selection") as HTMLSelectElement
  )?.tomselect.getValue();
  const datumId = (
    document.getElementById("data-selection") as HTMLSelectElement
  )?.tomselect.getValue();
  if (!userId || !datumId) {
    return;
  }

  const videoData = { userId, ...parseVideoString(datumId) };
  const videoUrl: string = `/video/?user-id=${videoData.userId}&video-id=${videoData.videoId}&start-time=${videoData.startTime}&end-time=${videoData.endTime}`;
  console.log(videoUrl);
  const response = await fetch(videoUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (response.ok) {
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    const videoPlayer = document.querySelector("video") as HTMLVideoElement;
    videoPlayer.src = videoUrl;
  } else {
    console.error("Failed to load video");
  }
}
