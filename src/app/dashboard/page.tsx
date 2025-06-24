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

  // Redirect to home if not logged in (should never happen due to middleware, but just in case)
  if (!session?.user) {
    redirect('/');
  }

  let companies: Company[] = [];
  const userName = session.user.name ?? null;

  // 2. Check the user's role and fetch companies accordingly
  if (session.user.role === 'ADMIN') {
    // If user is an ADMIN, fetch ALL companies from the database
    companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
  } else {
    // For regular users, use the companies assigned in their session
    companies = (session.user.companies as Company[]) ?? [];

    // Redirect regular users if they have no company (this should be handled by middleware, but we ensure it here)
    if (companies.length === 0) {
      redirect('/wait');
    }
  }

  // 3. Determine the initial company to display
  const initialCompanyId = companies[0]?.id ?? null;

  // 4. Render the Client Component and pass the data as props
  return (
    <DashboardClient
      companies={companies}
      initialCompanyId={initialCompanyId}
      userName={userName}
    />
  );
}