import { useState, useEffect } from 'react';

interface SMSUsageData {
  used: number;
  limit: number;
  percentage: number;
  isLoading: boolean;
}

export function useSMSUsage(): SMSUsageData {
  const [data, setData] = useState<SMSUsageData>({
    used: 0,
    limit: 1000,
    percentage: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate loading and return mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const used = 450;
        const limit = 1000;
        
        setData({
          used,
          limit,
          percentage: (used / limit) * 100,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to fetch SMS usage:', error);
        setData({
          used: 0,
          limit: 1000,
          percentage: 0,
          isLoading: false
        });
      }
    };

    fetchUsage();
  }, []);

  return data;
}