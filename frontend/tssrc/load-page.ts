export async function loadPage(url: string): Promise<void> {
  try {
    const accessToken: string | null = localStorage.getItem("accessToken");
    const response: Response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const page: string = await response.text();
      document.documentElement.innerHTML = page;
      const scripts: DocumentFragment = await loadScripts(page);
      document.body.appendChild(scripts);
    } else {
      throw new Error("Failed to load page");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function loadScripts(html: string): Promise<DocumentFragment> {
  const parser: DOMParser = new DOMParser();
  const doc: Document = parser.parseFromString(html, "text/html");
  const scripts: NodeListOf<HTMLScriptElement> = doc.querySelectorAll("script");
  const fragment: DocumentFragment = document.createDocumentFragment();
  scripts.forEach((script) => {
    fragment.appendChild(copyScript(script));
  });
  return new Promise((resolve) => {
    resolve(fragment);
  });
}

function copyScript(script: HTMLScriptElement): HTMLScriptElement {
  const newScript: HTMLScriptElement = document.createElement("script");

  for (let attr of Array.from(script.attributes)) {
    newScript.setAttribute(attr.name, attr.value);
  }
  newScript.textContent = script.textContent;
  return newScript;
}
