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
      const response = await fetch('/api/shareholder/');
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
    setShareholder(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchShareholder();

    // 设置定时刷新（每30秒）和页面可见性变化时刷新
    const intervalId = setInterval(() => {
      fetchShareholder({ silent: true });
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchShareholder({ silent: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
