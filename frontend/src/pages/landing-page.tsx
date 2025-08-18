import React from "react";
import { useLocation } from "wouter";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-5xl font-bold mb-6">Welcome to BizBook</h1>
      <p className="text-lg mb-8 text-gray-700">Your all-in-one business finance dashboard.</p>
      <div className="flex gap-4">
        <SignInButton mode="modal">
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
            Login
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">
            Register
          </button>
        </SignUpButton>
      </div>
      
      {/* Alternative: Link to auth page */}
      <div className="mt-4 text-sm text-gray-600">
        Or{' '}
        <button
          onClick={() => setLocation("/auth")}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          go to auth page
        </button>
      </div>
    </div>
  );
}
