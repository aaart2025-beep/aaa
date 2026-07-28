import { describe, it, expect } from "vitest";
import { saveConflict, stampContent } from "@/lib/content/version";
import type { SiteContent } from "@/lib/content/types";

const content = { texts: {}, products: [], collections: [], navVisible: {} } as unknown as SiteContent;

describe("stampContent", () => {
  it("adds a fresh updatedAt stamp", () => {
    const stamped = stampContent(content);
    expect(typeof stamped.updatedAt).toBe("string");
    expect(new Date(stamped.updatedAt!).toString()).not.toBe("Invalid Date");
  });
});

describe("saveConflict", () => {
  it("no conflict when the store has no stamp yet (legacy content)", () => {
    expect(saveConflict(undefined, undefined)).toBe(false);
    expect(saveConflict("2026-07-27T10:00:00.000Z", undefined)).toBe(false);
  });
  it("no conflict when the client saved from the current version", () => {
    expect(saveConflict("2026-07-27T10:00:00.000Z", "2026-07-27T10:00:00.000Z")).toBe(false);
  });
  it("conflict when the store moved past the client's copy", () => {
    expect(saveConflict("2026-07-27T09:00:00.000Z", "2026-07-27T10:00:00.000Z")).toBe(true);
  });
  it("conflict when a stamped store receives an unstamped save (stale pre-stamp tab)", () => {
    expect(saveConflict(undefined, "2026-07-27T10:00:00.000Z")).toBe(true);
  });
});
