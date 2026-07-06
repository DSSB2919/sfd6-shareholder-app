'use client';

import { useEffect, useState } from 'react';
import { useShareholder } from '@/app/context/ShareholderContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { shareholder, loading } = useShareholder();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and token not expired
    const token = localStorage.getItem('token');
    const storedShareholder = localStorage.getItem('shareholder');
    const expiryStr = localStorage.getItem('token_expiry');
    
    if (!token || !storedShareholder) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    // Check token expiry
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (expiry < Date.now()) {
        // Token expired, clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('shareholder');
        localStorage.removeItem('shareholder_phone');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login';
        return;
      }
    }
    
    setIsAuthenticated(true);

    // Set up interval to check token expiry every 5 seconds
    const intervalId = setInterval(() => {
      const expiry = localStorage.getItem('token_expiry');
      if (expiry && parseInt(expiry, 10) < Date.now()) {
        // Token expired
        localStorage.removeItem('token');
        localStorage.removeItem('shareholder');
        localStorage.removeItem('shareholder_phone');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login';
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Show loading while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // If shareholder data is loaded but null, redirect to login
  if (!loading && !shareholder) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}
