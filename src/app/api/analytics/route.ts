// File: src/app/api/analytics/route.ts

import { auth } from '../../../auth';
import { type Session } from 'next-auth';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextRequest, NextResponse } from 'next/server';

const client_email = process.env.GA_CLIENT_EMAIL;
const private_key = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(req: NextRequest) {

  const session = (await auth()) as Session;
  // Get companyId from the request URL (e.g., /api/analytics?companyId=...)
  const requestedCompanyId = req.nextUrl.searchParams.get('companyId');

  if (!requestedCompanyId) {
    return new NextResponse('Company ID is required.', { status: 400 });
  }

  // Find the selected company in the user's list of companies
  const selectedCompany = session.user?.companies?.find(c => c.id === requestedCompanyId);

  // Security: Ensure the requested company belongs to the user and has a gaPropertyId
  const propertyId = selectedCompany?.gaPropertyId;

  if (!propertyId) {
    return new NextResponse('Unauthorized or Google Analytics Property ID not found.', {
      status: 401,
    });
  }
  const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email,
      private_key,
    },
  });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }],
      dimensions: [{ name: 'deviceCategory' }],
    });

    const analyticsData =
      response.rows?.map((row) => ({
        country: row.dimensionValues?.[0].value,
        activeUsers: row.metricValues?.[0].value,
        newUsers: row.metricValues?.[1].value,
      })) || [];

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    return new NextResponse('Error fetching Google Analytics data', { status: 500 });
  }
}