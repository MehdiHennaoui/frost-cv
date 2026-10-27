const ALLOWED_TAGS = new Set([
	"P",
	"BR",
	"STRONG",
	"EM",
	"B",
	"I",
	"UL",
	"OL",
	"LI",
	"A",
]);

const DROP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT"]);

/** Strips disallowed tags/attrs from TipTap HTML before preview render. */
export function sanitizeCvHtml(html: string): string {
	if (!html) {
		return "";
	}
	const doc = new DOMParser().parseFromString(html, "text/html");
	sanitizeNode(doc.body);
	return doc.body.innerHTML;
}

function sanitizeNode(node: Node) {
	const children = Array.from(node.childNodes);
	for (const child of children) {
		if (child.nodeType === Node.TEXT_NODE) {
			continue;
		}
		if (child.nodeType !== Node.ELEMENT_NODE) {
			node.removeChild(child);
			continue;
		}
		const el = child as HTMLElement;
		if (DROP_TAGS.has(el.tagName)) {
			node.removeChild(el);
			continue;
		}
		if (!ALLOWED_TAGS.has(el.tagName)) {
			while (el.firstChild) {
				node.insertBefore(el.firstChild, el);
			}
			node.removeChild(el);
			sanitizeNode(node);
			continue;
		}
		for (const attr of Array.from(el.attributes)) {
			if (el.tagName === "A" && attr.name === "href") {
				const href = attr.value.trim();
				if (/^(https?:|mailto:)/i.test(href)) {
					el.setAttribute("href", href);
					el.setAttribute("rel", "noopener noreferrer");
					el.setAttribute("target", "_blank");
				} else {
					el.removeAttribute("href");
				}
				continue;
			}
			el.removeAttribute(attr.name);
		}
		sanitizeNode(el);
	}
}
