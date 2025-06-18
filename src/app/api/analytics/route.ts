// File: src/app/api/analytics/route.ts

import { auth } from '../../../auth';
import { type Session } from 'next-auth';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

const client_email = process.env.GA_CLIENT_EMAIL;
const private_key = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(req: NextRequest) {
  const session = (await auth()) as Session;
  const requestedCompanyId = req.nextUrl.searchParams.get('companyId');

  if (!requestedCompanyId) {
    return new NextResponse('Company ID is required.', { status: 400 });
  }

  const isSuperAdmin = session.user?.role === 'ADMIN';
  const assignedCompany = session.user?.companies?.find(c => c.id === requestedCompanyId);
  
  if (!isSuperAdmin && !assignedCompany) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 3. Get the propertyId based on the user's role.
  let propertyId: string | null | undefined;
  if (isSuperAdmin) {
    // If admin, fetch the company details directly from the database.
    const companyFromDb = await prisma.company.findUnique({
      where: { id: requestedCompanyId },
      select: { gaPropertyId: true }
    });
    propertyId = companyFromDb?.gaPropertyId;
  } else {
    // If regular user, get it from their session object.
    propertyId = assignedCompany?.gaPropertyId;
  }

  // Final check to ensure we have a propertyId (we always should, ga4 ID will be a required field when adding a client in admin dashboard).
  if (!propertyId) {
    return new NextResponse('Google Analytics Property ID not found for this company.', {
      status: 404,
    });
  }

  const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: { client_email, private_key },
  });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }],
      dimensions: [{ name: 'deviceCategory' }],
    });

    const analyticsData =
      response.rows?.map((row) => ({
        deviceCategory: row.dimensionValues?.[0].value,
        activeUsers: row.metricValues?.[0].value,
        newUsers: row.metricValues?.[1].value,
      })) || [];

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    let errorMessage = 'An unknown error occurred while fetching analytics data.';
      if (error instanceof Error) {
        // The Google API client often puts more specific details in a `details` property
        if ('details' in error && typeof (error as { details: string }).details === 'string') {
            errorMessage = (error as { details: string }).details;
        } else {
            errorMessage = error.message;
        }
    }

    console.error('Error fetching Google Analytics data:', errorMessage);
    return new NextResponse(`Error fetching Google Analytics data: ${errorMessage}`, { status: 500 });
  }

  
}