import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const isRegister = window.location.search.includes("register=true");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {isRegister ? (
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
            redirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          />
        ) : (
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
            redirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
          />
        )}
      </div>
      
      {/* Toggle between sign in and sign up */}
      <div className="mt-6 text-center">
        {isRegister ? (
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setLocation('/auth')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign in
            </button>
          </p>
        ) : (
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => setLocation('/auth?register=true')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
