import { NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { auth } from '@/auth';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const { id } = await context.params;

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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const { id } = await context.params;

  try {
    await prisma.companiesOnUsers.deleteMany({
        where: { companyId: id },
    });
    await prisma.company.delete({
      where: { id: id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete company ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}