// app/api/callrail/calls/route.ts
import { auth } from '../../../../auth';
import { type Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { CallRailCallsApiResponse, CallRailApiError } from '@/types/callrail';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {

  const session = (await auth()) as Session;
  const requestedCompanyId = request.nextUrl.searchParams.get('companyId');

  if (!requestedCompanyId) {
    return new NextResponse('Company ID is required.', { status: 400 });
  }

  const isSuperAdmin = session.user?.role === 'ADMIN';
  const assignedCompany = session.user?.companies?.find(c => c.id === requestedCompanyId);
  
  if (!isSuperAdmin && !assignedCompany) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get the correct api keys based on the user's role.
  let accountId: string | null | undefined;
  let apiKey: string | null | undefined;
  if (isSuperAdmin) {
    // If admin, fetch the company details directly from the database.
    const companyFromDb = await prisma.company.findUnique({
      where: { id: requestedCompanyId },
      select: { 
        callrailAccountId: true,
        callrailApiKey: true
       }
    });
    accountId = companyFromDb?.callrailAccountId;
    apiKey = companyFromDb?.callrailApiKey;
  } else {
    // If regular user, get it from their session object.
    accountId = assignedCompany?.callrailAccountId;
    apiKey = assignedCompany?.callrailApiKey;
  }

  // Ensure environment variables are defined
  const callrailApiKey = apiKey;
  const callrailAccountId = accountId;

  if (!callrailApiKey || !callrailAccountId) {
    console.error("CallRail API Key or Account ID not configured correctly.");
    return NextResponse.json(
      { message: 'Configuration error: CallRail credentials missing.' },
      { status: 500 }
    );
  }

  // Extract query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const page = searchParams.get('page');

  // Default values
  const perPage = limit ? `&per_page=${Number(limit)}` : '&per_page=100';
  const currentPage = page ? `&offset=${Number(page)}` : '&offset=0';

  // Construct CallRail API URL
  const callrailApiUrl = `https://api.callrail.com/v3/a/${callrailAccountId}/calls.json?relative_pagination=true&date_range=last_30_days&fields=source${perPage}&${currentPage}`;

  try {
    const response = await fetch(callrailApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token token=${callrailApiKey}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Read response as text first in case it's an HTML error page
      const rawResponseText = await response.text();
      console.error(`CallRail API Error (${response.status}):`, rawResponseText);

      let errorDetails: any = rawResponseText;
      try {
        errorDetails = JSON.parse(rawResponseText); // Try to parse as JSON if it is
      } catch (parseError) {
        // Not JSON, keep raw text
      }

      return NextResponse.json(
        {
          message: `Error fetching data from CallRail (Status: ${response.status})`,
          details: errorDetails,
        } as CallRailApiError, // Cast to our error interface
        { status: response.status }
      );
    }

    const data: CallRailCallsApiResponse = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Server error fetching calls from CallRail (network/unexpected):', error);
    return NextResponse.json(
      { message: 'Internal Server Error', details: error.message } as CallRailApiError,
      { status: 500 }
    );
  }
}