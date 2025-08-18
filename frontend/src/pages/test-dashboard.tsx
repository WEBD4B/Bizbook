import React from 'react';

export default function TestDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Dashboard</h1>
      <p>This is a test dashboard to verify routing is working correctly.</p>
      <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded">
        <p>If you can see this, the routing and authentication are working properly!</p>
      </div>
    </div>
  );
}
