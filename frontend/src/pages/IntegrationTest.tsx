import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const IntegrationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const runIntegrationTests = async () => {
    setIsLoading(true);
    setTestResults(null);

    const results = {
      backendHealth: { status: 'pending', message: '' },
      authTest: { status: 'pending', message: '' },
      ordersTest: { status: 'pending', message: '' },
      firebaseTest: { status: 'pending', message: '' }
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
        
        // Store token for further tests
        localStorage.setItem('auth_token', authData.token);
        localStorage.setItem('user_data', JSON.stringify(authData.user));
      } else {
        results.authTest = { status: 'error', message: 'Authentication failed' };
      }
    } catch (error) {
      results.authTest = { status: 'error', message: `Auth test failed: ${error}` };
    }

    try {
      // Test 3: Orders Test (with auth token)
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
          setOrders(ordersData.data || []);
        } else {
          results.ordersTest = { status: 'error', message: 'Orders API failed' };
        }
      } else {
        results.ordersTest = { status: 'error', message: 'No auth token found' };
      }
    } catch (error) {
      results.ordersTest = { status: 'error', message: `Orders test failed: ${error}` };
    }

    try {
      // Test 4: Firebase Test
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

    setTestResults(results);
    setIsLoading(false);
    toast.success('Integration tests completed');
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
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Frontend-Backend Integration Test
            </CardTitle>
            <CardDescription>
              Complete integration test between frontend and backend with mock data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runIntegrationTests} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Integration Tests...
                </>
              ) : (
                'Run Complete Integration Test'
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

            {orders.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Sample Orders Data:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.slice(0, 6).map((order) => (
                    <Card key={order.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">#{order.id}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.shipping_status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {order.shipping_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">
                          {order.days_in_ready_to_pack > 0 ? `${order.days_in_ready_to_pack} days` : 'On time'}
                        </p>
                        {order.note && (
                          <p className="text-xs text-gray-500 italic">"{order.note}"</p>
                        )}
                        {order.attention && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Needs Attention</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Integration Status:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Frontend:</strong> React + TypeScript + Tailwind</p>
                <p><strong>Backend:</strong> Node.js + Express + Firebase</p>
                <p><strong>Data Source:</strong> Mock Brazilian orders</p>
                <p><strong>Authentication:</strong> Token-based with demo accounts</p>
                <p><strong>Notes Storage:</strong> Firebase Firestore</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationTest;
