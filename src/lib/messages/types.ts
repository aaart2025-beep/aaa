/* Contact-form messages captured on the site and shown in the admin inbox. */

export type MessageStatus = "unread" | "read" | "archived";
export const MESSAGE_STATUSES: MessageStatus[] = ["unread", "read", "archived"];

export interface Message {
  id: string;
  createdAt: string; // ISO
  name: string;
  email: string;
  phone?: string;
  subject: string;
  body: string;
  status: MessageStatus;
}

/** Short human-friendly message reference, e.g. "MSG-7F3K2A". */
export function newMessageId(seed: number): string {
  const base = Math.abs(Math.floor(seed)).toString(36).toUpperCase().slice(-6).padStart(6, "0");
  return `MSG-${base}`;
}
