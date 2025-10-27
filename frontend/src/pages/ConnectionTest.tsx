import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const ConnectionTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults(null);

    const results = {
      backendHealth: { status: 'pending', message: '' },
      authTest: { status: 'pending', message: '' },
      firebaseTest: { status: 'pending', message: '' },
      ordersTest: { status: 'pending', message: '' }
    };

    try {
      // Test 1: Backend Health
      console.log('Testing backend health...');
      const healthResponse = await fetch(import.meta.env.VITE_API_URL + '/api/health');
      if (healthResponse.ok) {
        results.backendHealth = { status: 'success', message: 'Backend is running' };
      } else {
        results.backendHealth = { status: 'error', message: 'Backend health check failed' };
      }
    } catch (error) {
      results.backendHealth = { status: 'error', message: `Backend not reachable: ${error}` };
    }

    try {
      // Test 2: Auth Test
      console.log('Testing authentication...');
      const authResponse = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@nuvemshop.com', password: 'demo123' })
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        results.authTest = { status: 'success', message: `Login successful for ${authData.user.name}` };
      } else {
        results.authTest = { status: 'error', message: 'Authentication failed' };
      }
    } catch (error) {
      results.authTest = { status: 'error', message: `Auth test failed: ${error}` };
    }

    try {
      // Test 3: Firebase Test
      console.log('Testing Firebase...');
      const firebaseResponse = await fetch(import.meta.env.VITE_API_URL + '/api/firebase/test');
      if (firebaseResponse.ok) {
        const firebaseData = await firebaseResponse.json();
        results.firebaseTest = { status: 'success', message: 'Firebase connection successful' };
      } else {
        results.firebaseTest = { status: 'error', message: 'Firebase test failed' };
      }
    } catch (error) {
      results.firebaseTest = { status: 'error', message: `Firebase test failed: ${error}` };
    }

    try {
      // Test 4: Orders Test (with auth token)
      console.log('Testing orders API...');
      const token = localStorage.getItem('auth_token');
      if (token) {
        const ordersResponse = await fetch(import.meta.env.VITE_API_URL + '/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          results.ordersTest = { status: 'success', message: `Orders API working (${ordersData.count} orders)` };
        } else {
          results.ordersTest = { status: 'error', message: 'Orders API failed' };
        }
      } else {
        results.ordersTest = { status: 'error', message: 'No auth token found' };
      }
    } catch (error) {
      results.ordersTest = { status: 'error', message: `Orders test failed: ${error}` };
    }

    setTestResults(results);
    setIsLoading(false);
    toast.success('Connection tests completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Connection Test
            </CardTitle>
            <CardDescription>
              Test the connection between frontend and backend services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Connection Tests'
              )}
            </Button>

            {testResults && (
              <div className="space-y-3">
                <h3 className="font-semibold">Test Results:</h3>
                
                {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                  <Alert key={testName}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <AlertDescription className={getStatusColor(result.status)}>
                        <strong>{testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {result.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Debug Information:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Frontend URL:</strong> {window.location.origin}</p>
                <p><strong>API Base:</strong> {window.location.origin}/api</p>
                <p><strong>Auth Token:</strong> {localStorage.getItem('auth_token') ? 'Present' : 'Not found'}</p>
                <p><strong>User Data:</strong> {localStorage.getItem('user_data') ? 'Present' : 'Not found'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionTest;
