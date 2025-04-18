import { useState, useEffect } from 'react';

interface AnalyticsData {
  smsGrowth: number;
  callsGrowth: number;
  messagesGrowth: number;
  isLoading: boolean;
}

export function useAnalytics(): AnalyticsData {
  const [data, setData] = useState<AnalyticsData>({
    smsGrowth: 0,
    callsGrowth: 0,
    messagesGrowth: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate loading and return mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData({
          smsGrowth: 12.5,
          callsGrowth: 8.3,
          messagesGrowth: 15.2,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setData({
          smsGrowth: 0,
          callsGrowth: 0,
          messagesGrowth: 0,
          isLoading: false
        });
      }
    };

    fetchAnalytics();
  }, []);

  return data;
}