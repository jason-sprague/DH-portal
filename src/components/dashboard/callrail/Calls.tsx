// all calls report
'use client'; // This directive makes it a Client Component

import { useState, useEffect, useCallback } from 'react';
import { Call, CallRailCallsApiResponse, CallRailApiError } from '@/types/callrail';
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 100; // Define how many items to fetch per load

interface CallrailCallsProps {
  selectedCompanyId: string;
}


export default function CallrailCalls({ selectedCompanyId }: CallrailCallsProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true); // To control "Load More" button visibility

  const callsColumns: ColumnDef<Call>[] = [
    {
        accessorKey: "customer_name",
        header: "Customer Name",
    },
    {
        accessorKey: "customer_phone_number",
        header: "Customer Phone Number",
    },
    {
        accessorKey: "duration",
        header: "Duration",
    },
    {
        accessorKey: "source",
        header: "Source",
    },
    {
        accessorKey: "start_time",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("start_time")).toLocaleString();
            return <div>{date}</div>
        }
    },
    {
        accessorKey: "recording_player",
        header: "Recording",
        cell: ({ row }) => {
            const link = <a href={row.getValue("recording_player")} target='_blank' rel='noopener noreferrer'>Listen to Recording</a>;
            return link
        }
    },
  ]

  // useCallback to memoize the fetch function and prevent unnecessary re-creations
  const fetchCallData = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Fetch from our Route Handler, passing the current page and limit
      const response = await fetch(`/api/callrail/calls?companyId=${selectedCompanyId}&limit=${ITEMS_PER_PAGE}&page=${pageNumber}`);

      if (!response.ok) {
        const errorData: CallRailApiError = await response.json();
        throw new Error(errorData.message || 'Failed to fetch calls from API');
      }

      const data: CallRailCallsApiResponse = await response.json();

      // Append new calls to the existing list
      setCalls((prevCalls) => [...prevCalls, ...(data.calls || [])]);

      // Determine if there are more pages to load
      setHasMore(data.has_next_page);

    } catch (err: any) {
      setError(err.message);
      setHasMore(false); // Stop trying to load more on error
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]); // Empty dependency array because it uses state/props via its arguments, not directly from closure

  // Effect to load initial calls and subsequent pages when 'page' changes
  useEffect(() => {
    fetchCallData(page);
  }, [selectedCompanyId, page, fetchCallData]); // Re-run when 'page' or 'fetchCallData' changes

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  if (loading) {
    return <div>Loading calls...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div>
      <h2>Recent Calls (Last 30 Days)</h2>
      {calls.length === 0 ? (
        <p>No calls found.</p>
      ) : (
        <DataTable columns={callsColumns} data={calls} />
      )}
      {!loading && hasMore && (
        <Button onClick={handleLoadMore}>Load More Calls</Button>
      )}
    </div>
  );
}