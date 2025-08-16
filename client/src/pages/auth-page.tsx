import React, { useState } from "react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isRegister = window.location.search.includes("register=true");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded authentication
    if (!isRegister && username === "admin" && password === "password") {
      setIsAuthenticated(true);
      setError("");
      setLocation("/dashboard");
    } else if (isRegister && username && password) {
      setIsAuthenticated(true);
      setError("");
      setLocation("/dashboard");
    } else {
      setError(isRegister ? "Please enter username and password" : "Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">{isRegister ? "Register" : "Login"}</h1>
      <form onSubmit={handleAuth} className="bg-white p-6 rounded shadow-md w-80">
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
          {isRegister ? "Register" : "Login"}
        </button>
      </form>
    </div>
  );
}
