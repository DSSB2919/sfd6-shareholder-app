'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shareholder } from '@/types';

interface ShareholderContextType {
  shareholder: Shareholder | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => void;
}

const ShareholderContext = createContext<ShareholderContextType | undefined>(undefined);

export function ShareholderProvider({ children }: { children: ReactNode }) {
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShareholder = async (options?: { silent?: boolean }) => {
    try {
      // 非静默模式才显示 loading
      if (!options?.silent) {
        setLoading(true);
      }

      // 检查 Token 是否过期
      if (!checkTokenExpiry()) {
        setLoading(false);
        return;
      }

      // 获取当前登录用户的手机号
      const phone = localStorage.getItem('shareholder_phone');
      
      // 首先尝试从 localStorage 获取（快速显示）
      const storedShareholder = localStorage.getItem('shareholder');
      const hasCache = storedShareholder && !options?.silent;
      if (hasCache) {
        try {
          const parsed = JSON.parse(storedShareholder);
          setShareholder(parsed);
          // 有缓存时先隐藏 loading，让页面立即显示
          setLoading(false);
        } catch {
          // 解析失败，继续从 API 获取
        }
      }

      // 从 API 获取最新数据（总是执行，确保数据同步）
      // 使用手机号查询当前登录股东，确保获取正确的数据
      const apiUrl = phone ? `/api/shareholder?phone=${encodeURIComponent(phone)}` : '/api/shareholder';
      const response = await fetch(apiUrl);
      if (!response.ok) {
        // 如果 API 失败但有缓存，保留缓存数据，只记录错误
        if (!hasCache) {
          throw new Error('Failed to fetch shareholder data');
        }
        console.warn('Failed to refresh shareholder data, using cached');
        return;
      }
      const data = await response.json();

      // 只有数据变化时才更新（避免不必要的重渲染）
      setShareholder(prev => {
        const hasChanged = !prev || JSON.stringify(prev) !== JSON.stringify(data);
        if (hasChanged) {
          localStorage.setItem('shareholder', JSON.stringify(data));
          return data;
        }
        return prev;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch shareholder error:', err);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('shareholder');
    localStorage.removeItem('shareholder_phone');
    localStorage.removeItem('token_expiry');
    setShareholder(null);
    window.location.href = '/login';
  };

  // 检查 Token 是否过期
  const checkTokenExpiry = () => {
    const token = localStorage.getItem('token');
    const expiryStr = localStorage.getItem('token_expiry');
    
    if (!token) return false;

    const now = Date.now();
    
    // 优先使用存储的过期时间
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (expiry < now) {
        console.log('Token expired (from storage), logging out...');
        logout();
        return false;
      }
      return true;
    }

    // 备用：从 token 中解析
    try {
      const payload = JSON.parse(atob(token));
      
      // Token 过期
      if (payload.exp && payload.exp < now) {
        console.log('Token expired (from token), logging out...');
        logout();
        return false;
      }
      return true;
    } catch {
      // Token 解析失败，视为过期
      logout();
      return false;
    }
  };

  useEffect(() => {
    // 初始加载时检查 Token
    if (!checkTokenExpiry()) {
      setLoading(false);
      return;
    }
    
    fetchShareholder();

    // 设置定时刷新（每5秒）和检查 Token 过期
    const intervalId = setInterval(() => {
      // 先检查 Token 是否过期
      if (!checkTokenExpiry()) {
        return;
      }
      fetchShareholder({ silent: true });
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchShareholder({ silent: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 监听 storage 事件，当其他标签页修改了 localStorage 时刷新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shareholder_updated') {
        console.log('Shareholder data updated in another tab, refreshing...');
        fetchShareholder({ silent: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 监听页面点击事件，用户操作时刷新数据
    const handleUserInteraction = () => {
      fetchShareholder({ silent: true });
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  return (
    <ShareholderContext.Provider value={{ shareholder, loading, error, refresh: fetchShareholder, logout }}>
      {children}
    </ShareholderContext.Provider>
  );
}

export function useShareholder() {
  const context = useContext(ShareholderContext);
  if (context === undefined) {
    throw new Error('useShareholder must be used within a ShareholderProvider');
  }
  return context;
}
