// src/app/dashboard/page.tsx

import { auth } from '@/auth'; // Server-side auth
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma'; // Server-side DB access
import DashboardClient from '@/components/dashboard/DashboardClient'; // Your new client component
import { type Company } from '../../../generated/prisma';

// This is now an async Server Component
export default async function DashboardPage() {
  // 1. Get session on the server
  const session = await auth();
  // Middleware handles the main login check, but this is a good safeguard
  if (!session?.user) {
    redirect('/');
  }

  let companies: Company[] = [];
  const userName = session.user.name ?? null;

  if (session.user.role === 'ADMIN') {
    // Admins see all companies
    companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
  } else {
    // Regular users get their companies from the session object
    companies = session.user.companies ?? [];
    
    // If a regular user is logged in but has no companies, redirect to /wait
    if (companies.length === 0) {
      redirect('/wait');
    }
  }
  const initialCompanyId = companies[0]?.id ?? null;

  return (
    <DashboardClient
      companies={companies}
      initialCompanyId={initialCompanyId}
      userName={userName}
    />
  );
}