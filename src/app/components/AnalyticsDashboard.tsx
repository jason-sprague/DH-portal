'use client';

import { useState, useEffect } from 'react';

// Define the structure of our analytics data
interface AnalyticsData {
  country: string;
  activeUsers: string;
  newUsers: string;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const result: AnalyticsData[] = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading Analytics Data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Analytics Data (Last 30 Days)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Country</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Active Users</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>New Users</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.country}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.activeUsers}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.newUsers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}