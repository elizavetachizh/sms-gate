import { Outlet } from '@tanstack/react-router'

export function AppLayout() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
      <Outlet />
    </main>
  )
}
