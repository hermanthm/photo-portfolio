export type AboutBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

const BULLET_PATTERN = /^[•\-]\s+/;
const SKIP_HEADINGS = new Set(["about me", "about"]);

function isHeading(line: string): boolean {
  const normalized = line.trim().toLowerCase();

  if (SKIP_HEADINGS.has(normalized)) {
    return false;
  }

  return line.length <= 60 && !line.endsWith(".") && !line.includes("?");
}

export function parseAboutContent(content: string): AboutBlock[] {
  const lines = content.split("\n").map((line) => line.trim());

  const blocks: AboutBlock[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({ type: "list", items: listItems });
    listItems = [];
  }

  for (const line of lines) {
    if (line.length === 0) {
      flushList();
      continue;
    }

    if (BULLET_PATTERN.test(line)) {
      flushList();
      listItems.push(line.replace(BULLET_PATTERN, ""));
      continue;
    }

    flushList();

    if (isHeading(line)) {
      blocks.push({ type: "heading", text: line });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  flushList();

  return blocks;
}