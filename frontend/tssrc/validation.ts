function getValidDataStr(user: User): string {
  const total: number = user.data.length;
  const validCount: number = user.data.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue.valid === true ? 1 : 0);
  }, 0);
  return `(${validCount}/${total})`;
}

async function getUserOptions(): Promise<
  Array<{ id: string; validCount: string }>
> {
  const usersData: Array<User> = JSON.parse(
    sessionStorage.getItem("users") || "[]"
  );
  const usersList = usersData.map((user) => ({
    id: user.id,
    validCount: getValidDataStr(user),
  }));
  return usersList;
}

function getDataOptions(targetUser: string): {
  id: string;
  validatedMark: string;
  videoId: string;
  timeRange: string;
}[] {
  const users: Array<User> = JSON.parse(
    sessionStorage.getItem("users") || "[]"
  );
  const userData = users.find((user) => user.id === targetUser);
  const dataList: Array<{
    id: string;
    validatedMark: string;
    videoId: string;
    timeRange: string;
  }> = [];

  if (userData && userData.data) {
    userData.data.forEach((datum) => {
      dataList.push({
        id: datum.id,
        validatedMark: datum.validated ? (datum.valid ? "✅" : "❌") : "❗️",
        videoId: datum.video_id,
        timeRange: `[${datum.start_time} - ${datum.end_time}]`,
      });
    });
  }
  return dataList;
}

async function saveUserData(): Promise<void> {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const response = await fetch("/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Bearer 스키마를 사용한 인증 헤더 설정
      },
    });
    const users = await response.json();
    sessionStorage.setItem("users", JSON.stringify(users));
  }
}

async function initTomSelect(): Promise<void> {
  const userSelect = new TomSelect("#user-selection", {
    create: false,
    valueField: "id",
    searchField: ["id"],
    options: [],
    render: {
      option: function (
        user: { id: string; validCount: string },
        escape: (value: string) => string
      ) {
        return `<div class="user-info"><div class="user-id">${escape(
          user.id
        )}</div><div class="valid-count">${escape(
          user.validCount
        )}</div></div>`;
      },
      item: function (
        user: { id: string; validCount: string },
        escape: (value: string) => string
      ) {
        return `<div id="selected-user">${escape(user.id)} ${escape(
          user.validCount
        )}</div>`;
      },
    },
    onInitialize: async () => {
      await saveUserData();
    },
  });

  new TomSelect("#data-selection", {
    create: false,
    valueField: "id",
    searchField: ["id"],
    options: [],
    render: {
      option: function (
        data: {
          id: string;
          validatedMark: string;
          videoId: string;
          timeRange: string;
        },
        escape: (value: string) => string
      ) {
        return `<div class="data-info"><div class="validated-mark">${escape(
          data.validatedMark
        )}</div><div class="data-id">${escape(
          data.videoId
        )}</div><div class="time-range">${escape(data.timeRange)}</div></div>`;
      },
      item: function (
        data: { id: string; validatedMark: string; videoId: string },
        escape: (value: string) => string
      ) {
        return `<div id="selected-data">${escape(data.validatedMark)} ${escape(
          data.id
        )}</div>`;
      },
    },
    onFocus: () => {
      updateDataSelection(userSelect.getValue() as string);
    },
  });

  new TomSelect("#speaking-type-selection", {
    create: false,
    controlInput: null,
    allowEmptyOption: true,
  });

  new TomSelect("#gender-selection", {
    create: false,
    controlInput: null,
    allowEmptyOption: true,
  });

  new TomSelect("#age-selection", {
    create: false,
    controlInput: null,
    allowEmptyOption: true,
  });
}

async function waitForTomSelect(): Promise<void> {
  if (typeof TomSelect !== "undefined") {
    await initTomSelect();
  } else {
    setTimeout(waitForTomSelect, 100);
  }
}

async function initializeSelections(): Promise<void> {
  try {
    await waitForTomSelect();
    await saveUserData();
    const userOptions = await getUserOptions();
    const userSelect = (
      document.getElementById("user-selection") as HTMLSelectElement
    )?.tomselect;
    userSelect.addOptions(userOptions);
    userSelect.on("change", () => {
      updateDataSelection(userSelect.getValue() as string);
    });
  } catch (e) {
    console.error("Error: ", e);
  }
}

function updateDataSelection(user: string): void {
  const dataSelect = (
    document.getElementById("data-selection") as HTMLSelectElement
  )?.tomselect;
  dataSelect.clearOptions();
  dataSelect.addOptions(getDataOptions(user));
}

async function fetchVideo(): Promise<void> {
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
  const response = await fetch(
    `/video/?user-id=${videoData.userId}&video-id=${videoData.videoId}&start-time=${videoData.startTime}&end-time=${videoData.endTime}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.ok) {
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    const videoPlayer = document.querySelector("video") as HTMLVideoElement;
    videoPlayer.src = videoUrl;
  } else {
    console.error("Failed to load video");
  }
}

async function initializeButtons(): Promise<void> {
  //	document
  //		.getElementById("valid-button")
  //		?.addEventListener("click", () => setDatumValidated(true));
  //	document
  //		.getElementById("invalid-button")
  //		?.addEventListener("click", () => setDatumValidated(false));
  document
    .getElementById("fetch-button")
    ?.addEventListener("click", fetchVideo);
}

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

(async () => {
  await initializeSelections();
  await initializeButtons();
})();
