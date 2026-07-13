import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog";

describe("Dialog accessibility", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  });
  it("links dialog to title and description via aria attributes", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Заголовок</DialogTitle>
          <DialogDescription>Описание диалога</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { hidden: true });
    const title = screen.getByText("Заголовок");
    const description = screen.getByText("Описание диалога");

    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(description.id);
    expect(title.id).toBeTruthy();
    expect(description.id).toBeTruthy();
  });

  it("omits aria-describedby when description is not rendered", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Только заголовок</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { hidden: true });

    expect(dialog.getAttribute("aria-labelledby")).toBe(
      screen.getByText("Только заголовок").id,
    );
    expect(dialog.getAttribute("aria-describedby")).toBeNull();
  });
});
