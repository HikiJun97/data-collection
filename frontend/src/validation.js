"use strict";
function getValidDataStr(user) {
    const total = user.data.length;
    const validCount = user.data.reduce((accumulator, currentValue) => {
        return accumulator + (currentValue.valid === true ? 1 : 0);
    }, 0);
    return `(${validCount}/${total})`;
}
async function getUserOptions() {
    const usersData = JSON.parse(sessionStorage.getItem("users") || "[]");
    const usersList = usersData.map((user) => ({
        id: user.id,
        validCount: getValidDataStr(user),
    }));
    return usersList;
}
function getDataOptions(targetUser) {
    const users = JSON.parse(sessionStorage.getItem("users") || "[]");
    const userData = users.find((user) => user.id === targetUser);
    const dataList = [];
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
async function saveUserData() {
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
async function initTomSelect() {
    const userSelect = new TomSelect("#user-selection", {
        create: false,
        valueField: "id",
        searchField: ["id"],
        options: [],
        render: {
            option: function (user, escape) {
                return `<div class="user-info"><div class="user-id">${escape(user.id)}</div><div class="valid-count">${escape(user.validCount)}</div></div>`;
            },
            item: function (user, escape) {
                return `<div id="selected-user">${escape(user.id)} ${escape(user.validCount)}</div>`;
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
                return `<div class="data-info"><div class="validated-mark">${escape(data.validatedMark)}</div><div class="data-id">${escape(data.videoId)}</div><div class="time-range">${escape(data.timeRange)}</div></div>`;
            },
            item: function (data, escape) {
                return `<div id="selected-data">${escape(data.validatedMark)} ${escape(data.id)}</div>`;
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
    }
    else {
        setTimeout(waitForTomSelect, 100);
    }
}
async function initializeSelections() {
    try {
        await waitForTomSelect();
        await saveUserData();
        const userOptions = await getUserOptions();
        const userSelect = document.getElementById("user-selection")?.tomselect;
        userSelect.addOptions(userOptions);
        userSelect.on("change", () => {
            updateDataSelection(userSelect.getValue());
        });
    }
    catch (e) {
        console.error("Error: ", e);
    }
}
function updateDataSelection(user) {
    const dataSelect = document.getElementById("data-selection")?.tomselect;
    dataSelect.clearOptions();
    dataSelect.addOptions(getDataOptions(user));
}
async function fetchVideo() {
    const userId = document.getElementById("user-selection")?.tomselect.getValue();
    const datumId = document.getElementById("data-selection")?.tomselect.getValue();
    if (!userId || !datumId) {
        return;
    }
    const videoData = { userId, ...parseVideoString(datumId) };
    console.log(videoData);
}
async function initializeButtons() {
    //	document
    //		.getElementById("valid-button")
    //		?.addEventListener("click", () => setDatumValidated(true));
    //	document
    //		.getElementById("invalid-button")
    //		?.addEventListener("click", () => setDatumValidated(false));
    document
        .getElementById("check-button")
        ?.addEventListener("click", fetchVideo);
}
function parseVideoString(datumId) {
    const regex = /([a-zA-Z0-9_-]+) \[(\d{2}:\d{2}:\d{2}) - (\d{2}:\d{2}:\d{2})\]/;
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
