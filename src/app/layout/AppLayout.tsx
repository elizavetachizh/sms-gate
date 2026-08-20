import { Outlet } from "@tanstack/react-router";

export function AppLayout() {
  return (
    <main className="mx-auto w-full max-w-screen-xl flex-1 px-6 py-8">
      <Outlet />
    </main>
  );
}
