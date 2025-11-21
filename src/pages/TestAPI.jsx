// src/pages/TestAPI.jsx
import { useState } from 'react';
import { apiClient } from '@/services/apiClient';

export default function TestAPI() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEndpoint = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(endpoint);
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">🧪 API Integration Test</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => testEndpoint('/villages')} 
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
        >
          GET /villages
        </button>
        <button 
          onClick={() => testEndpoint('/villages/1')} 
          className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition"
        >
          GET /villages/1
        </button>
        <button 
          onClick={() => testEndpoint('/villages/1/statistics')} 
          className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600 transition"
        >
          GET /villages/1/statistics
        </button>
        <button 
          onClick={() => testEndpoint('/villages/1/publications')} 
          className="bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition"
        >
          GET /villages/1/publications
        </button>
      </div>

      {loading && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          ⏳ Loading...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-900 text-green-400 p-6 rounded overflow-auto" style={{ maxHeight: '500px' }}>
          <pre className="text-xs font-mono">{result}</pre>
        </div>
      )}
    </div>
  );
}