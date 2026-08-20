import { describe, expect, it } from "vitest";
import { mailingCreateSchema, mailingReplaceSchema } from "./mailing.schema";

const validMailing = {
  name: "Акция",
  provider_code: "fake",
  text_mode: "same" as const,
  shared_text: "Привет!",
  messages: [{ msisdn: "375291234567", text: "" }],
};

describe("mailingCreateSchema", () => {
  it("accepts same-text mailing with valid msisdn", () => {
    const result = mailingCreateSchema.safeParse(validMailing);

    expect(result.success).toBe(true);
  });

  it("accepts mailing without send_on", () => {
    const result = mailingCreateSchema.safeParse(validMailing);

    expect(result.success).toBe(true);
  });

  it("accepts empty send_on", () => {
    const result = mailingCreateSchema.safeParse({
      ...validMailing,
      send_on: "",
    });

    expect(result.success).toBe(true);
  });

  it("accepts datetime-local send_on", () => {
    const result = mailingCreateSchema.safeParse({
      ...validMailing,
      send_on: "2026-08-20T15:30",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid send_on", () => {
    const result = mailingCreateSchema.safeParse({
      ...validMailing,
      send_on: "not-a-date",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["send_on"]);
    }
  });

  it("accepts different-text mailing when each message has text", () => {
    const result = mailingCreateSchema.safeParse({
      name: "Акция",
      provider_code: "fake",
      text_mode: "different",
      shared_text: "",
      messages: [
        { msisdn: "375291234567", text: "Текст 1" },
        { msisdn: "375441234567", text: "Текст 2" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty provider_code", () => {
    const result = mailingCreateSchema.safeParse({
      ...validMailing,
      provider_code: "",
      shared_text: "Hi",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["provider_code"]);
    }
  });

  it("rejects invalid msisdn", () => {
    const result = mailingCreateSchema.safeParse({
      ...validMailing,
      shared_text: "Hi",
      messages: [{ msisdn: "abc", text: "" }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("msisdn")),
      ).toBe(true);
    }
  });

  it("rejects empty shared_text in same mode", () => {
    const result = mailingCreateSchema.safeParse({
      ...validMailing,
      shared_text: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("shared_text")),
      ).toBe(true);
    }
  });

  it("rejects empty message text in different mode", () => {
    const result = mailingCreateSchema.safeParse({
      name: "Акция",
      provider_code: "fake",
      text_mode: "different",
      shared_text: "",
      messages: [{ msisdn: "375291234567", text: "   " }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path[0] === "messages" &&
            issue.path[1] === 0 &&
            issue.path[2] === "text",
        ),
      ).toBe(true);
    }
  });

  it("rejects mailing without recipients", () => {
    const result = mailingCreateSchema.safeParse({
      ...validMailing,
      shared_text: "Hi",
      messages: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("messages")),
      ).toBe(true);
    }
  });
});

describe("mailingReplaceSchema", () => {
  const validMessages = {
    text_mode: "same" as const,
    shared_text: "Привет!",
    messages: [{ msisdn: "375291234567", text: "" }],
  };

  it("accepts messages without mailing name or send_on", () => {
    const result = mailingReplaceSchema.safeParse(validMessages);

    expect(result.success).toBe(true);
  });

  it("rejects empty shared_text in same mode", () => {
    const result = mailingReplaceSchema.safeParse({
      ...validMessages,
      shared_text: "   ",
    });

    expect(result.success).toBe(false);
  });
});
