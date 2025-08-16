import React from "react";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-5xl font-bold mb-6">Welcome to BizBook</h1>
      <p className="text-lg mb-8 text-gray-700">Your all-in-one business finance dashboard.</p>
      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700"
          onClick={() => setLocation("/auth")}
        >
          Login
        </button>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700"
          onClick={() => setLocation("/auth?register=true")}
        >
          Register
        </button>
      </div>
    </div>
  );
}
