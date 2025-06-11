import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

// Get the required environment variables
const propertyId = process.env.GA_PROPERTY_ID;
const client_email = process.env.GA_CLIENT_EMAIL;
// Replace `\n` characters with actual newlines
const private_key = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Instantiate the Google Analytics Data Client
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email,
    private_key,
  },
});

export async function GET() {
  if (!propertyId) {
    return new NextResponse('Missing Google Analytics Property ID', { status: 500 });
  }

  try {
    // Make a request to the Google Analytics Data API
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
        {
          name: 'newUsers',
        },
      ],
      dimensions: [
        {
          name: 'country',
        },
      ],
    });

    // Parse the response and format it
    const analyticsData = response.rows?.map(row => ({
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