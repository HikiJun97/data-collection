export async function loadPage(element, url, selector) {
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
            const htmlText = await response.text();
            await loadHtml(element, htmlText, selector);
            await loadStyles(htmlText);
            await loadScripts(htmlText);
        }
        else {
            throw new Error("Failed to load page");
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
}
export async function loadWholePage(url) {
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
            const textHtml = await response.text();
            await loadHtml(document.documentElement, textHtml, "html");
            await loadStyles(textHtml);
            await loadScripts(textHtml);
        }
        else {
            throw new Error("Failed to load page");
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
}
async function loadHtml(element, textHtml, selector) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(textHtml, "text/html");
    const targetElement = doc.querySelector(selector);
    element.innerHTML = targetElement.innerHTML;
    Array.from(targetElement.attributes).forEach((attr) => {
        element.setAttribute(attr.name, attr.value);
    });
}
async function loadStyles(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.querySelectorAll("link[rel='stylesheet']");
    const styles = doc.querySelectorAll("style");
    // print each style element
    styles.forEach((style) => {
        console.log(style.innerHTML);
    });
    const fragment = document.createDocumentFragment();
    links.forEach((link) => {
        fragment.appendChild(copyLink(link));
    });
    styles.forEach((style) => {
        fragment.appendChild(copyStyle(style));
    });
    document.head.appendChild(fragment);
}
async function loadScripts(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const scripts = doc.querySelectorAll("script");
    const fragment = document.createDocumentFragment();
    scripts.forEach((script) => {
        fragment.appendChild(copyScript(script));
    });
    document.body.appendChild(fragment);
}
function copyLink(link) {
    const newLink = document.createElement("link");
    for (let attr of Array.from(link.attributes)) {
        newLink.setAttribute(attr.name, attr.value);
    }
    newLink.textContent = link.textContent;
    return newLink;
}
function copyStyle(style) {
    const newStyle = document.createElement("style");
    for (let attr of Array.from(style.attributes)) {
        newStyle.setAttribute(attr.name, attr.value);
    }
    newStyle.textContent = style.textContent;
    return newStyle;
}
function copyScript(script) {
    const newScript = document.createElement("script");
    for (let attr of Array.from(script.attributes)) {
        newScript.setAttribute(attr.name, attr.value);
    }
    newScript.textContent = script.textContent;
    return newScript;
}
