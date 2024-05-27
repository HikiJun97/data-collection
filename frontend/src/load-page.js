export async function loadPage(url) {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (response.ok) {
            const page = await response.text();
            document.documentElement.innerHTML = page;
            const scripts = await loadScripts(page);
            document.body.appendChild(scripts);
        }
        else {
            throw new Error("Failed to load page");
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
}
async function loadScripts(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const scripts = doc.querySelectorAll("script");
    const fragment = document.createDocumentFragment();
    scripts.forEach((script) => {
        fragment.appendChild(copyScript(script));
    });
    return new Promise((resolve) => {
        resolve(fragment);
    });
}
function copyScript(script) {
    const newScript = document.createElement("script");
    for (let attr of Array.from(script.attributes)) {
        newScript.setAttribute(attr.name, attr.value);
    }
    newScript.textContent = script.textContent;
    return newScript;
}
