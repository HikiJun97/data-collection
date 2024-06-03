import { verifyToken, username } from "../verify.js";
// import {loadPage} from "./load-page.js";

function validateInput(input: HTMLInputElement): boolean {
  if (input.value === "") {
    input.style.border = "1px solid red";
    return false;
  }
  input.style.border = "1px solid #ccc";
  return true;
}

async function issueToken(
  userId: string,
  userPw: string,
  rememberMe: boolean
): Promise<void> {
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

async function addLoginEvent(): Promise<void> {
  document
    .getElementById("loginForm")
    ?.addEventListener("submit", async (event: Event) => {
      event.preventDefault();
      try {
        const userIdInput = document.getElementById(
          "user-id"
        ) as HTMLInputElement;
        const userPwInput = document.getElementById(
          "user-password"
        ) as HTMLInputElement;
        const rememberMeCheck = document.getElementById(
          "remember-me"
        ) as HTMLInputElement;

        if (!validateInput(userIdInput) || !validateInput(userPwInput)) {
          // TODO: Add error message to be appeared on the screen
          throw new Error("Empty input");
        }

        await issueToken(
          userIdInput.value,
          userPwInput.value,
          rememberMeCheck.checked
        );
        console.log("Cookie saved");
        window.location.href = "/index";
        return;
      } catch (e) {
        const errorMsg = document.getElementById("errorMsg") as HTMLDivElement;
        errorMsg.style.display = "block";
        if (e instanceof Error) {
          errorMsg.innerText = e.message;
        } else {
          errorMsg.innerText = "An unknown error occurred";
        }
      }
    });
}

(async () => {
  try {
    const username: username = await verifyToken();
    console.log("username:", username);
    window.location.href = "/index";
  } catch (e) {
    await addLoginEvent();
  }
})();

// document.addEventListener("DOMContentLoaded", sendRequestWithToken);
