import { NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { auth } from '@/auth';

// GET all users and include their related companies
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { email: 'asc' },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST a new user and associate them with companies
export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { email, name, image, role, companyIds } = await request.json();

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                image,
                role,
                companies: {
                    create: companyIds.map((id: string) => ({
                        company: {
                            connect: { id },
                        },
                    })),
                },
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Failed to create user:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}