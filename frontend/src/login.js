import { verifyToken } from "./verify.js";
// import {loadPage} from "./load-page.js";
function validateInput(input) {
    if (input.value === "") {
        input.style.border = "1px solid red";
        return false;
    }
    input.style.border = "1px solid #ccc";
    return true;
}
async function issueToken(userId, userPw, rememberMe) {
    const res = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: userId,
            userPw: userPw,
            rememberMe: rememberMe,
        }),
    });
    const data = await res.json();
    if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        window.location.href = "/index";
    }
}
async function addLoginEvent() {
    document
        .getElementById("loginForm")
        ?.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
            const userIdInput = document.getElementById("user-id");
            const userPwInput = document.getElementById("user-password");
            const rememberMeCheck = document.getElementById("remember-me");
            if (!validateInput(userIdInput) || !validateInput(userPwInput)) {
                // TODO: Add error message to be appeared on the screen
                throw new Error("Empty input");
            }
            await issueToken(userIdInput.value, userPwInput.value, rememberMeCheck.checked);
            console.log("Cookie saved");
            window.location.href = "/index";
            return;
        }
        catch (e) {
            const errorMsg = document.getElementById("errorMsg");
            errorMsg.style.display = "block";
            if (e instanceof Error) {
                errorMsg.innerText = e.message;
            }
            else {
                errorMsg.innerText = "An unknown error occurred";
            }
        }
    });
}
(async () => {
    try {
        const username = await verifyToken();
        console.log("username:", username);
        window.location.href = "/index";
    }
    catch (e) {
        await addLoginEvent();
    }
})();
// document.addEventListener("DOMContentLoaded", sendRequestWithToken);
