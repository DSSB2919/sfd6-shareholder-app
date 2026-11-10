'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 登录页必须绕过守卫，否则未登录用户会被反复重定向到当前页面。
    if (isLoginPage) {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // 检查管理员登录状态
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const expiryStr = localStorage.getItem('admin_token_expiry');
      
      if (!token) {
        window.location.href = '/admin/login';
        return false;
      }

      // 检查 Token 是否过期
      const now = Date.now();
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        if (expiry < now) {
          // Token 过期，清除数据并跳转
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_token_expiry');
          window.location.href = '/admin/login';
          return false;
        }
      }
      
      return true;
    };

    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    setLoading(false);

    // 设置定时检查 Token 过期
    const intervalId = setInterval(() => {
      const expiryStr = localStorage.getItem('admin_token_expiry');
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        if (expiry < Date.now()) {
          // Token 过期，清除数据并跳转
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_token_expiry');
          window.location.href = '/admin/login';
        }
      }
    }, 5000);

    // 页面可见性变化时检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoginPage]);

  // 登录页不显示验证状态，直接渲染登录表单。
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 显示加载状态
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 未认证则跳转
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
