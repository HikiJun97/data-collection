function getValidDataStr(user) {
  const total = user.data.length;
  const validCount = user.data.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue.valid === true ? 1 : 0);
  }, 0);
  return "(" + validCount + "/" + total + ")";
}

async function getUserOptions() {
  let usersData = JSON.parse(sessionStorage.getItem("users"));
  let usersList = [];
  usersData.forEach((user) => {
    usersList.push({ id: user.id, validCount: getValidDataStr(user) });
  });
  return usersList;
}

function getDataOptions(targetUser) {
  let userData = JSON.parse(sessionStorage.getItem("users")).find(
    (user) => user.id === targetUser
  );
  let dataList = [];
  console.log(userData);
  if (userData.data !== undefined) {
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

async function saveUserData() {
  const accessToken = localStorage.getItem("accessToken");
  await fetch("/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Bearer 스키마를 사용한 인증 헤더 설정
    },
  })
    .then((response) => response.json())
    .then((users) => {
      sessionStorage.setItem("users", JSON.stringify(users));
    });
}

async function initTomSelect() {
  const userSelect = new TomSelect("#user-selection", {
    create: false,
    valueField: "id",
    searchField: ["id"],
    // options: userOptions,
    options: [],
    render: {
      option: function (user, escape) {
        return `<div class="user-info"><div class="user-id">${escape(user.id)}</div><div class="valid-count">${escape(user.validCount)}</div>`;
      },
      item: function (user, escape) {
        return `<div id="selected-user">${user.id} ${user.validCount}</div>`;
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
      option: function (data, escape) {
        return `<div class="data-info"><div class="validated-mark">${escape(data.validated)}</div><div class="data-id">${escape(data.videoId)}</div><div class="time-range">${escape(data.timeRange)}</div></div>`;
      },
      item: function (data, escape) {
        return `<div id="selected-data">${data.validated} ${data.id}</div>`;
      },
    },
    onFocus: () => {
      updateDataSelection(userSelect.getValue());
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

async function waitForTomSelect() {
  if (typeof TomSelect !== "undefined") {
    await initTomSelect();
  } else {
    setTimeout(waitForTomSelect, 100);
  }
}

async function initializeSelections() {
  try {
    await waitForTomSelect();
    await saveUserData();
    let userOptions = await getUserOptions();
    const userSelect = document.getElementById("user-selection").tomselect;
    userSelect.addOptions(userOptions);
    userSelect.on("change", () => {
      updateDataSelection(userSelect.getValue());
    });
  } catch (e) {
    console.error("Error: ", e);
  }
}

function updateDataSelection(user) {
  const dataSelect = document.getElementById("data-selection").tomselect;
  dataSelect.clearOptions();
  dataSelect.addOptions(getDataOptions(user));
}

(async () => {
  initializeSelections();
})();
