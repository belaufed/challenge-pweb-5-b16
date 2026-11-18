import type { Note } from "../types/note";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const POSTS_API_URL = (
  configuredApiUrl || "http://localhost:3000/api/posts"
).replace(/\/+$/, "");

async function readResponse(response: Response): Promise<unknown> {
  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      body
        ? `API error (${response.status}): ${body}`
        : `API error (${response.status} ${response.statusText})`,
    );
  }

  if (!body) {
    return undefined;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error("API mengembalikan respons JSON yang tidak valid.");
  }
}

function extractNote(value: unknown): Note {
  if (typeof value !== "object" || value === null) {
    throw new Error("Data post dari API tidak valid.");
  }

  const record = value as Record<string, unknown>;

  if ("data" in record) {
    return extractNote(record.data);
  }
  if ("post" in record) {
    return extractNote(record.post);
  }

  const { id, title, content, body, category } = record;
  const noteContent = content ?? body;
  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof title !== "string" ||
    typeof noteContent !== "string" ||
    (category !== undefined && typeof category !== "string")
  ) {
    throw new Error("Data post API harus memiliki id, title, dan content/body.");
  }

  return {
    id: String(id),
    title,
    content: noteContent,
    category: typeof category === "string" ? category : "Umum",
  };
}

function extractNotes(payload: unknown): Note[] {
  if (Array.isArray(payload)) {
    return payload.map(extractNote);
  }

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    const posts = record.posts ?? record.data ?? record.results;

    if (posts !== undefined) {
      return extractNotes(posts);
    }
  }

  throw new Error("API posts harus mengembalikan array post.");
}

export async function getNotes(
  search: string,
  signal?: AbortSignal,
): Promise<Note[]> {
  const url = new URL(POSTS_API_URL, window.location.origin);
  const query = search.trim();
  if (query) {
    url.searchParams.set("search", query);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });

  return extractNotes(await readResponse(response));
}

export async function createNote(
  note: Pick<Note, "title" | "content" | "category">,
): Promise<Note | null> {
  const response = await fetch(POSTS_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: note.title,
      content: note.content,
      body: note.content,
      category: note.category,
      userId: 1,
    }),
  });
  const payload = await readResponse(response);

  return payload === undefined ? null : extractNote(payload);
}

export async function removeNote(id: string): Promise<void> {
  const response = await fetch(`${POSTS_API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  await readResponse(response);
}
