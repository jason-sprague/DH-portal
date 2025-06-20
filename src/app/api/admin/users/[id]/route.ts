import { NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { auth } from '@/auth';

// Define the context type
interface RouteContext {
  params: {
    id: string;
  };
}

// PUT (update) a specific user
export async function PUT(request: Request, context: RouteContext) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const params = await context.params;
    const { id } = params;

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


// DELETE a specific user
export async function DELETE(request: Request, context: RouteContext) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const params = await context.params;
    const { id } = params;
    
    try {
        await prisma.user.delete({
            where: { id: id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Failed to delete user ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}