// Interface for a single Call object from CallRail API
export interface Call {
  id: number; // CallRail often uses numeric IDs for calls
  uuid: string; // Unique identifier (UUID)
  caller_id: string;
  source: string; // e.g., 'Google Ads', 'Organic Search'
  duration: number; // in seconds
  start_time: string; // ISO 8601 string, e.g., "2023-10-27T10:00:00Z"
  end_time: string; // ISO 8601 string
  tracking_number: string;
  agent_name?: string; // Optional: May not always be present
  direction: 'inbound' | 'outbound';
  // ... add any other fields you need from the CallRail Call object
  // Refer to CallRail API documentation for all possible fields:
  // https://apidocs.callrail.com/#calls
}

// Interface for the overall response when fetching a list of calls
export interface CallRailCallsApiResponse {
  calls: Call[];
  page?: number;
  per_page?: number;
  total_pages?: number;
  total_entries?: number;
  has_next_page: boolean;
  next_page?: string;
  // ... other pagination or meta info
}

// Interface for a generic error response from our API route or CallRail
export interface CallRailApiError {
  message: string;
  details?: any; // Can be more specific if CallRail's error structure is known
}