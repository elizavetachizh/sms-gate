import { describe, expect, it } from "vitest";

import {
  filterMessagesExcludingIds,
  messagesToUpdatePayload,
} from "@/features/mailings/lib/mailing-messages-update";
import type { MessageRead } from "@/shared/api";

function createMessage(
  msisdn: string,
  status: MessageRead["status"] = "created",
): MessageRead {
  return {
    id: msisdn,
    msisdn,
    text: "Hello",
    external_id: null,
    status,
    batch_id: null,
  };
}

describe("filterMessagesExcludingIds", () => {
  it("removes only created messages with matching ids", () => {
    const messages = [
      createMessage("375291234567"),
      createMessage("375331234567"),
      createMessage("375441234567", "queued"),
    ];

    const remaining = filterMessagesExcludingIds(
      messages,
      new Set(["375291234567", "375441234567"]),
    );

    expect(remaining.map((message) => message.msisdn)).toEqual([
      "375331234567",
      "375441234567",
    ]);
  });
});

describe("messagesToUpdatePayload", () => {
  it("maps only msisdn and text", () => {
    const payload = messagesToUpdatePayload([
      createMessage("375291234567"),
      createMessage("375331234567"),
    ]);

    expect(payload).toEqual([
      {
        msisdn: "375291234567",
        text: "Hello",
      },
      {
        msisdn: "375331234567",
        text: "Hello",
      },
    ]);
  });
});
