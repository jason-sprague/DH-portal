'use client';
import { signOut, useSession } from 'next-auth/react';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import Image from 'next/image';

export default function DashboardPage() {
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(' ')[0] || 'User';
  return (
    <main className="flex min-h-screen p-4">
      <div className="header">
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome, {firstName}!</h1>
          <p className="">You&apos;re looking very handsome today. </p>
        </div>
        <div className="logo">
          <Image alt="dykstra hamel logo" src="/dykstra-hamel-logo.svg" width={300} height={50} />
        </div>
        <button
          onClick={() => signOut()}
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
          <AnalyticsDashboard />
 
    </main>
  );
}