export default function DashboardPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to your dashboard!</p>
      {/* Add your dashboard components here */}
      <div className="w-full max-w-4xl">
        {/* Example chart component */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sample Chart</h2>
          {/* Replace with actual chart component */}
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            Chart Placeholder
          </div>
        </div>
      </div>
    </main>
  );
}