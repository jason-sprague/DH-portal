import { NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { auth } from '@/auth';

// GET all companies and include their related users
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: {
        users: {
          include: {
            user: true, 
          },
        },
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST a new company
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const newCompany = await prisma.company.create({
      data: {
        name: data.name,
        accessLevel: data.accessLevel,
        gaPropertyId: data.gaPropertyId,
      },
    });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('Failed to create company:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}