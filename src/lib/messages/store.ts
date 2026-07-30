import { promises as fs } from "node:fs";
import path from "node:path";
import type { Message, MessageStatus } from "./types";
import { blobEnabled, readJsonBlob, writeJsonBlob } from "@/lib/blob-json";

/* Message store — mirrors the order store. On Vercel (with a Blob token or a
 * connected store) messages persist durably in Blob; locally with no token they
 * fall back to a JSON file under /data. */

const BLOB_KEY = "messages";
const FILE = path.join(process.cwd(), "data", "messages.json");

export async function readMessages(): Promise<Message[]> {
  if (blobEnabled) {
    const fromBlob = await readJsonBlob<Message[]>(BLOB_KEY);
    return Array.isArray(fromBlob) ? fromBlob : [];
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Message[]) : [];
  } catch {
    return [];
  }
}

async function writeMessages(messages: Message[]): Promise<void> {
  if (blobEnabled) {
    await writeJsonBlob(BLOB_KEY, messages);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(messages, null, 2), "utf8");
}

/** Append a new message (newest persisted last; callers sort for display). */
export async function appendMessage(message: Message): Promise<void> {
  const messages = await readMessages();
  messages.push(message);
  await writeMessages(messages);
}

/** Change a message's status (read / unread / archived). */
export async function updateMessageStatus(id: string, status: MessageStatus): Promise<Message | null> {
  const messages = await readMessages();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const updated: Message = { ...messages[idx], status };
  await writeMessages(messages.map((m, i) => (i === idx ? updated : m)));
  return updated;
}

/** Permanently delete a message. Returns true if one was removed. */
export async function deleteMessage(id: string): Promise<boolean> {
  const messages = await readMessages();
  const next = messages.filter((m) => m.id !== id);
  if (next.length === messages.length) return false;
  await writeMessages(next);
  return true;
}
