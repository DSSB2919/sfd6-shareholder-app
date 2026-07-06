'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Cashier {
  id: number;
  username: string;
  name: string;
  is_admin: boolean;
}

interface CashierContextType {
  cashier: Cashier | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

const CashierContext = createContext<CashierContextType | undefined>(undefined);

export function CashierProvider({ children }: { children: ReactNode }) {
  const [cashier, setCashier] = useState<Cashier | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('cashier_token');
    localStorage.removeItem('cashier');
    localStorage.removeItem('cashier_token_expiry');
    setCashier(null);
    window.location.href = '/cashier-login';
  };

  // 检查 Token 是否过期
  const checkTokenExpiry = () => {
    const token = localStorage.getItem('cashier_token');
    const expiryStr = localStorage.getItem('cashier_token_expiry');
    
    if (!token) return false;

    const now = Date.now();
    
    // 优先使用存储的过期时间
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (expiry < now) {
        console.log('Cashier token expired, logging out...');
        logout();
        return false;
      }
      return true;
    }

    // 备用：从 token 中解析
    try {
      const payload = JSON.parse(atob(token));
      
      if (payload.exp && payload.exp < now) {
        console.log('Cashier token expired (from token), logging out...');
        logout();
        return false;
      }
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const checkAuth = () => {
    // 初始检查
    if (!checkTokenExpiry()) {
      return false;
    }

    // 加载收银员信息
    const storedCashier = localStorage.getItem('cashier');
    if (storedCashier) {
      try {
        setCashier(JSON.parse(storedCashier));
      } catch {
        logout();
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    // 初始认证检查
    const isAuth = checkAuth();
    setLoading(false);

    if (!isAuth) {
      return;
    }

    // 设置定时检查 Token 过期（每 5 秒）
    const intervalId = setInterval(() => {
      checkTokenExpiry();
    }, 5000);

    // 页面可见性变化时检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <CashierContext.Provider value={{ cashier, loading, logout, checkAuth }}>
      {children}
    </CashierContext.Provider>
  );
}

export function useCashier() {
  const context = useContext(CashierContext);
  if (context === undefined) {
    throw new Error('useCashier must be used within a CashierProvider');
  }
  return context;
}
