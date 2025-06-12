'use client';
import { signOut, useSession } from 'next-auth/react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

export default function DashboardPage() {
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(' ')[0] || 'User';
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {firstName}!</h1>
      <p className="text-gray-600 mb-8">You're looking very handsome today. </p>
      {/* Add your dashboard components here */}
      <div className="w-full max-w-4xl">
        {/* Example chart component */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* Replace with actual chart component */}
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <AnalyticsDashboard />
          </div>
        </div>
      </div>
            <button
      onClick={() => signOut()}
      style={{
        padding: '10px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Sign Out
    </button>
    </main>
  );
}