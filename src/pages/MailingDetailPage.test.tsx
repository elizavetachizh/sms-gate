import "@/test/mocks/shared-api";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { defaultMailingsSearch } from "@/features/mailings/search";
import {
  mailingFixture,
  messageFixture,
  providersListFixture,
} from "@/test/fixtures";
import { mailingsApi, providersApi } from "@/test/mocks/shared-api";
import { createTestQueryClient } from "@/test/utils/render-hook";
import { MailingDetailPage } from "./MailingDetailPage";

function renderMailingDetail(mailingId: string) {
  const queryClient = createTestQueryClient();
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "/_authenticated",
    component: () => <Outlet />,
  });
  const mailingsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/mailings",
    validateSearch: () => defaultMailingsSearch,
    component: () => null,
  });
  const mailingDetailRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/mailings/$mailingId",
    component: MailingDetailPage,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      authenticatedRoute.addChildren([mailingsRoute, mailingDetailRoute]),
    ]),
    history: createMemoryHistory({
      initialEntries: [`/mailings/${mailingId}`],
    }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

async function findConfirmDialog(title: string) {
  const heading = await screen.findByRole("heading", {
    name: title,
    hidden: true,
  });
  const dialog = heading.closest("dialog");

  if (!dialog) {
    throw new Error(`Confirm dialog "${title}" not found`);
  }

  return within(dialog);
}

describe("MailingDetailPage send confirmation", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
  });

  it("asks to confirm send with name, count and provider", async () => {
    const user = userEvent.setup();
    const mailing = mailingFixture({
      name: "Test mailing",
      messages: [
        messageFixture({ text: "Скидка 10%" }),
        messageFixture({
          id: "770e8400-e29b-41d4-a716-446655440003",
          msisdn: "375291234568",
          text: "Скидка 10%",
        }),
      ],
    });
    vi.mocked(mailingsApi.getById).mockResolvedValue(mailing);
    vi.mocked(providersApi.list).mockResolvedValue(providersListFixture);
    vi.mocked(mailingsApi.send).mockResolvedValue({
      message: "Mailing batched",
    });

    renderMailingDetail(mailing.id);

    await user.click(await screen.findByRole("button", { name: "Отправить" }));

    const dialog = await findConfirmDialog("Отправить 2 SMS?");
    expect(dialog.getByText(/Test mailing/)).toBeInTheDocument();
    expect(dialog.getByText(/Fake provider/)).toBeInTheDocument();

    await user.click(
      dialog.getByRole("button", { name: "Отправить", hidden: true }),
    );

    await waitFor(() => {
      expect(mailingsApi.send).toHaveBeenCalledWith(mailing.id);
    });
  });

  it("does not send when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const mailing = mailingFixture();
    vi.mocked(mailingsApi.getById).mockResolvedValue(mailing);
    vi.mocked(providersApi.list).mockResolvedValue(providersListFixture);

    renderMailingDetail(mailing.id);

    await user.click(await screen.findByRole("button", { name: "Отправить" }));
    await user.click(
      (await findConfirmDialog("Отправить 1 SMS?")).getByRole("button", {
        name: "Отмена",
        hidden: true,
      }),
    );

    expect(mailingsApi.send).not.toHaveBeenCalled();
  });

  it("disables send when the mailing has no messages", async () => {
    const mailing = mailingFixture({ messages: [] });
    vi.mocked(mailingsApi.getById).mockResolvedValue(mailing);
    vi.mocked(providersApi.list).mockResolvedValue(providersListFixture);

    renderMailingDetail(mailing.id);

    const sendButton = await screen.findByRole("button", { name: "Отправить" });

    expect(sendButton).toBeDisabled();
    expect(
      screen.getByTitle("Добавьте хотя бы одно сообщение"),
    ).toBeInTheDocument();
  });
});
