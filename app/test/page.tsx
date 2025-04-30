'use client';

import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/lib/clientApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestPage() {
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setStatus(null);
    
    try {
      const result = await testSupabaseConnection();
      setStatus({
        success: result,
        message: result ? 'Connection successful!' : 'Connection failed. Check console for details.'
      });
    } catch (error) {
      console.error('Test error:', error);
      setStatus({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-24">
      <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
      
      <Card className="p-6 mb-8">
        <p className="mb-4">Test if the Supabase connection is working properly.</p>
        <Button onClick={runTest} disabled={loading}>
          {loading ? 'Testing...' : 'Test Connection'}
        </Button>
      </Card>
      
      {status && (
        <Card className={`p-6 ${status.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <h2 className="text-xl font-semibold mb-2">Test Result</h2>
          <p className={status.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
            {status.message}
          </p>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
          {`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}\n`}
          {`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}\n`}
          {`NEXT_PUBLIC_STATIC_EXPORT: ${process.env.NEXT_PUBLIC_STATIC_EXPORT}\n`}
          {`NODE_ENV: ${process.env.NODE_ENV}`}
        </pre>
      </div>
    </div>
  );
} 