export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Freshdesk Analytics Dashboard
          </h1>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
