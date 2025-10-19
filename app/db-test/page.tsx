'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DbTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();
      
      setResult(data);
      if (!data.success) {
        setError(data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Error testing DB connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-24">
      <h1 className="text-3xl font-bold mb-8">Database Connection Test</h1>
      
      <Card className="p-6 mb-8">
        <p className="mb-4">Test if the Supabase connection is working through the API route.</p>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test API Connection'}
        </Button>
      </Card>
      
      {error && (
        <Card className="p-6 mb-8 bg-red-50 dark:bg-red-900/20">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </Card>
      )}
      
      {result && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">API Response</h2>
          <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
          {`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}\n`}
          {`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}\n`}
          {`NEXT_PUBLIC_STATIC_EXPORT: ${process.env.NEXT_PUBLIC_STATIC_EXPORT || 'not set'}\n`}
          {`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`}
        </pre>
      </Card>
    </div>
  );
} 