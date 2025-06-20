// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { auth } from '@/auth';

// Type the context argument inline for the PUT function.
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
        const { email, name, image, role, companyIds } = await request.json();
        const updatedUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: id },
                data: { email, name, image, role },
            });
            await tx.companiesOnUsers.deleteMany({
                where: { userId: id },
            });
            if (companyIds && companyIds.length > 0) {
                await tx.companiesOnUsers.createMany({
                    data: companyIds.map((companyId: string) => ({
                        userId: id,
                        companyId,
                    })),
                });
            }
            return user;
        });
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(`Failed to update user ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// Apply the same inline type for the DELETE function's context.
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
        // Using a transaction to first delete relationships, then the user.
        await prisma.$transaction(async (tx) => {
          // 1. Delete the user's links to any companies in the join table.
          await tx.companiesOnUsers.deleteMany({
            where: { userId: id },
          });
    
          // 2. Now that the user is no longer restricted, delete the user itself.
          await tx.user.delete({
            where: { id: id },
          });
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Failed to delete user ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}