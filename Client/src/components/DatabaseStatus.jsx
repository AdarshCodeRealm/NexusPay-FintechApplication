import React, { useState, useEffect } from 'react';

const DatabaseStatus = () => {
  const [status, setStatus] = useState({ loading: true, connected: false, error: null });

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://server-one-sooty.vercel.app/api/v1';
        console.log('🔍 Checking database status at:', apiBaseUrl);
        
        const response = await fetch(`${apiBaseUrl}/health`);
        const data = await response.json();
        
        if (data.success && data.database?.status === 'Connected') {
          setStatus({ 
            loading: false, 
            connected: true, 
            error: null,
            details: data
          });
        } else {
          setStatus({ 
            loading: false, 
            connected: false, 
            error: data.message || 'Database connection failed',
            details: data
          });
        }
      } catch (error) {
        console.error('Database status check failed:', error);
        setStatus({ 
          loading: false, 
          connected: false, 
          error: error.message,
          details: null
        });
      }
    };

    checkDatabaseStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (status.loading) {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        <span className="text-sm">Checking database connection...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${status.connected ? 'text-green-600' : 'text-red-600'}`}>
      <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-600' : 'bg-red-600'}`}></div>
      <span className="text-sm font-medium">
        {status.connected ? '✅ Database Connected' : '❌ Database Disconnected'}
      </span>
      {status.error && (
        <span className="text-xs text-gray-500">({status.error})</span>
      )}
    </div>
  );
};

export default DatabaseStatus;