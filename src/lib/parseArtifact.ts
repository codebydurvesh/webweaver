import type { ParsedAction, ParsedArtifact } from "@/types";

const CLOSE_TAG = "</boltAction>";

/**
 * Parse the model's response into an artifact (title + a list of file/shell
 * actions).
 *
 * This is written to be **streaming-tolerant**: it can be called repeatedly on
 * a growing string. The final, still-incomplete action (no closing tag yet) is
 * returned with `complete: false` and whatever content has arrived so far, so
 * the UI can show a file's code being written live.
 *
 * It deliberately avoids a single greedy regex over the whole body — file
 * contents routinely contain `<`, `>` and even `</...>` from JSX/HTML, so we
 * locate the matching close tag with `indexOf` instead of regex backtracking.
 */
export function parseArtifact(text: string): ParsedArtifact {
  const title = extractAttr(
    text.match(/<boltArtifact\b([^>]*)>/)?.[1] ?? "",
    "title"
  );

  const actions: ParsedAction[] = [];

  // Matches an *opening* <boltAction ...> tag. Requires the closing `>` of the
  // tag itself, so a half-streamed opening tag is ignored until it completes.
  const openTag = /<boltAction\b([^>]*)>/g;
  let match: RegExpExecArray | null;

  while ((match = openTag.exec(text)) !== null) {
    const attrs = match[1];
    const contentStart = match.index + match[0].length;
    const closeIdx = text.indexOf(CLOSE_TAG, contentStart);
    const complete = closeIdx !== -1;
    const rawContent = complete
      ? text.slice(contentStart, closeIdx)
      : text.slice(contentStart);

    const type = extractAttr(attrs, "type") === "file" ? "file" : "shell";
    const filePath = extractAttr(attrs, "filePath");

    actions.push({
      type,
      filePath: filePath || undefined,
      content: cleanContent(rawContent),
      complete,
    });

    if (!complete) break; // nothing valid can follow a still-open action
    // Resume scanning right after this action's close tag.
    openTag.lastIndex = closeIdx + CLOSE_TAG.length;
  }

  return { title, actions };
}

/** Pull a double-quoted attribute value out of a tag's attribute string. */
function extractAttr(attrs: string, name: string): string | undefined {
  const m = attrs.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m?.[1];
}

/**
 * Normalize an action body. The model wraps file contents under the tag and
 * routinely indents every line by a fixed amount (e.g. 4 spaces). We:
 *   1. drop the leading newline after the opening tag,
 *   2. trim trailing whitespace before the close tag,
 *   3. remove the common leading indentation so code lands at column 0.
 */
function cleanContent(value: string): string {
  return dedent(value.replace(/^\r?\n/, "").replace(/\s+$/, ""));
}

/** Strip the smallest shared leading-whitespace from every non-blank line. */
function dedent(value: string): string {
  const lines = value.split("\n");
  let min = Infinity;
  for (const line of lines) {
    if (line.trim() === "") continue; // ignore blank lines
    const indent = line.length - line.trimStart().length;
    if (indent < min) min = indent;
  }
  if (min === Infinity || min === 0) return value;
  return lines.map((line) => line.slice(min)).join("\n");
}
