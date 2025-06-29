'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Define the structure of our analytics data
interface AnalyticsData {
  deviceCategory: string;
  activeUsers: string;
  newUsers: string;
}
interface AnalyticsDashboardProps {
  selectedCompanyId: string;
}

export const description = "A simple pie chart"

export function AnalyticsDashboard({ selectedCompanyId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// this runs whenever selectedCompanyId changes since I added it to the dependency array
  useEffect(() => {
    async function fetchData() {
      // If no company is selected, do nothing.
      if (!selectedCompanyId) return;

      setLoading(true);
      setError(null);

      try {
        // Use the selectedCompanyId in the API request
        const response = await fetch(`/api/analytics?companyId=${selectedCompanyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const result: AnalyticsData[] = await response.json();
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCompanyId]);

  const colorPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const chartData =  data?.map((item, index) => ({
  deviceCategory: item.deviceCategory,
  visitors: parseInt(item.activeUsers, 10),
  fill: colorPalette[index % colorPalette.length],
}));

  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    desktop: {
      label: "desktop",
      color: "var(--chart-1)",
    },
    safari: {
      label: "Safari",
      color: "var(--chart-2)",
    },
    firefox: {
      label: "Firefox",
      color: "var(--chart-3)",
    },
    edge: {
      label: "Edge",
      color: "var(--chart-4)",
    },
    other: {
      label: "Other",
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig

  if (loading) return <div>Loading Analytics Data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Card className="flex flex-col p-5 m-10">
      <CardHeader className="items-center pb-0">
        <CardTitle>Website Traffic By Device</CardTitle>
        <CardDescription>Last 30 Days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="visitors" nameKey="deviceCategory" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 30 days
        </div>
      </CardFooter>
    </Card>
      
    </>
  );
}