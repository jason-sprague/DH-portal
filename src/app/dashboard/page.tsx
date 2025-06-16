'use client';
import { useState, useEffect } from 'react'; // Import useEffect
import { signOut, useSession } from 'next-auth/react';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import Image from 'next/image';

export default function DashboardPage() {
  const { data: session } = useSession();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const firstName = session?.user?.name?.split(' ')[0] || 'User';
  const companies = session?.user?.companies ?? [];

    // If there's no selected company yet and the user has companies,
    // set the first one as the default, otherwise it will be null on load.
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="header">
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome, {firstName}!</h1>
          <p className="">You&apos;re looking very handsome today. </p>

          {companies.length > 1 && (
            <div className="mt-4">
              <label htmlFor="company-select" className="block text-sm font-medium text-gray-300">
                Select a Company:
              </label>
              <select
                id="company-select"
                value={selectedCompanyId ?? ''}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="logo">
          <Image alt="dykstra hamel logo" src="/dykstra-hamel-logo.svg" width={300} height={50} />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            padding: '10px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            width: '150px',
            height: '50px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
          Sign Out
        </button>
      </div>
          
      {selectedCompanyId ? (
        <AnalyticsDashboard selectedCompanyId={selectedCompanyId} />
      ) : (
        <div>Loading...</div>
      )}
 
    </main>
  );
}