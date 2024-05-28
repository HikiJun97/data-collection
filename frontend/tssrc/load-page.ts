export async function loadPage(
  element: HTMLElement,
  url: string,
  selector: string
): Promise<void> {
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
      const htmlText: string = await response.text();
      await loadHtml(element, htmlText, selector);
      await loadStyles(htmlText);
      await loadScripts(htmlText);
    } else {
      throw new Error("Failed to load page");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function loadWholePage(url: string): Promise<void> {
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
      const textHtml: string = await response.text();
      await loadHtml(document.documentElement, textHtml, "html");
      await loadStyles(textHtml);
      await loadScripts(textHtml);
    } else {
      throw new Error("Failed to load page");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function loadHtml(
  element: HTMLElement,
  textHtml: string,
  selector: string
): Promise<void> {
  const parser: DOMParser = new DOMParser();
  const doc: Document = parser.parseFromString(textHtml, "text/html");
  const targetElement = doc.querySelector(selector) as HTMLElement;
  element.innerHTML = targetElement.innerHTML;
  Array.from(targetElement.attributes).forEach((attr) => {
    element.setAttribute(attr.name, attr.value);
  });
}

async function loadStyles(html: string): Promise<void> {
  const parser: DOMParser = new DOMParser();
  const doc: Document = parser.parseFromString(html, "text/html");
  const links: NodeListOf<HTMLLinkElement> = doc.querySelectorAll(
    "link[rel='stylesheet']"
  );
  const styles: NodeListOf<HTMLStyleElement> = doc.querySelectorAll("style");
  // print each style element
  styles.forEach((style) => {
    console.log(style.innerHTML);
  });
  const fragment: DocumentFragment = document.createDocumentFragment();

  links.forEach((link) => {
    fragment.appendChild(copyLink(link));
  });

  styles.forEach((style) => {
    fragment.appendChild(copyStyle(style));
  });

  document.head.appendChild(fragment);
}

async function loadScripts(html: string): Promise<void> {
  const parser: DOMParser = new DOMParser();
  const doc: Document = parser.parseFromString(html, "text/html");
  const scripts: NodeListOf<HTMLScriptElement> = doc.querySelectorAll("script");
  const fragment: DocumentFragment = document.createDocumentFragment();
  scripts.forEach((script) => {
    fragment.appendChild(copyScript(script));
  });
  document.body.appendChild(fragment);
}

function copyLink(link: HTMLLinkElement): HTMLLinkElement {
  const newLink: HTMLLinkElement = document.createElement("link");

  for (let attr of Array.from(link.attributes)) {
    newLink.setAttribute(attr.name, attr.value);
  }
  newLink.textContent = link.textContent;
  return newLink;
}

function copyStyle(style: HTMLStyleElement): HTMLStyleElement {
  const newStyle: HTMLStyleElement = document.createElement("style");

  for (let attr of Array.from(style.attributes)) {
    newStyle.setAttribute(attr.name, attr.value);
  }
  newStyle.textContent = style.textContent;
  return newStyle;
}

function copyScript(script: HTMLScriptElement): HTMLScriptElement {
  const newScript: HTMLScriptElement = document.createElement("script");

  for (let attr of Array.from(script.attributes)) {
    newScript.setAttribute(attr.name, attr.value);
  }
  newScript.textContent = script.textContent;
  return newScript;
}
