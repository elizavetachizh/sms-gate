import { describe, expect, it } from "vitest";
import { buildMailingMessagesPayload } from "./build-mailing-messages-payload";

describe("buildMailingMessagesPayload", () => {
  it("maps shared text onto every recipient", () => {
    const payload = buildMailingMessagesPayload({
      text_mode: "same",
      shared_text: "Привет!",
      messages: [
        { msisdn: "375291234567", text: "" },
        { msisdn: "375291234568", text: "" },
      ],
    });

    expect(payload).toEqual([
      { msisdn: "375291234567", text: "Привет!" },
      { msisdn: "375291234568", text: "Привет!" },
    ]);
  });

  it("keeps per-message text in different mode", () => {
    const payload = buildMailingMessagesPayload({
      text_mode: "different",
      shared_text: "",
      messages: [{ msisdn: "375291234567", text: "Текст 1" }],
    });

    expect(payload).toEqual([{ msisdn: "375291234567", text: "Текст 1" }]);
  });
});
