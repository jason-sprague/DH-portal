import { NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { auth } from '@/auth';

// Define the context type
interface RouteContext {
  params: {
    id: string;
  };
}

// PUT (update) a specific company
export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const params = await context.params;
  const { id } = params;

  try {
    const data = await request.json();
    const updatedCompany = await prisma.company.update({
      where: { id: id },
      data: {
        name: data.name,
        accessLevel: data.accessLevel,
        gaPropertyId: data.gaPropertyId,
      },
    });
    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error(`Failed to update company ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE a specific company
export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const params = await context.params;
  const { id } = params;

  try {
    // First, dissociate users from the company
    await prisma.companiesOnUsers.deleteMany({
        where: { companyId: id },
    });

    // Then, delete the company
    await prisma.company.delete({
      where: { id: id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete company ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}