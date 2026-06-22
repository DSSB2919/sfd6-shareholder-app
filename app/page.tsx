'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 简单的错误边界组件
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
      <h1 className="mb-4 text-2xl font-bold text-red-400">页面加载出错</h1>
      <p className="mb-4 text-white/60">错误信息: {error.message}</p>
      <pre className="max-w-full overflow-auto rounded bg-zinc-900 p-4 text-sm text-white/80">
        {error.stack}
      </pre>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-zinc-950"
      >
        重新加载
      </button>
    </div>
  );
}

// 简化的首页组件
export default function HomePage() {
  const [error, setError] = useState<Error | null>(null);
  const [shareholder, setShareholder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // 从 localStorage 获取股东信息
      const stored = localStorage.getItem('shareholder');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded shareholder:', parsed);
        setShareholder(parsed);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading shareholder:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-white">加载中...</p>
      </div>
    );
  }

  if (!shareholder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-white">
        <h1 className="mb-4 text-2xl font-bold">未登录</h1>
        <p className="mb-4 text-white/60">请先登录</p>
        <a
          href="/login"
          className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-zinc-950"
        >
          去登录
        </a>
      </div>
    );
  }

  // 安全地获取数值
  const pointsBalance = shareholder?.points_balance ?? 0;
  const weeklyPoints = shareholder?.weekly_points ?? 0;
  const sharePercent = shareholder?.share_percent ?? 0;
  const tier = shareholder?.tier ?? 'Unknown';
  const name = shareholder?.name ?? 'Unknown';
  const memberNo = shareholder?.member_no ?? 'Unknown';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-6 pb-12 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-black text-white">SFD6 Shareholder</h1>
          <p className="mt-2 text-white/60">欢迎, {name}</p>
          <p className="text-sm text-white/40">编号: {memberNo}</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 pt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">Snow Points</p>
            <p className="mt-1 text-2xl font-black text-emerald-300">
              {pointsBalance.toLocaleString()}
            </p>
            <p className="text-xs text-white/40">{sharePercent}% {tier}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">每周积分</p>
            <p className="mt-1 text-2xl font-black text-white">
              {weeklyPoints.toLocaleString()}
            </p>
            <p className="text-xs text-white/40">本周可用</p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
          <p className="text-sm font-bold text-amber-200">调试信息</p>
          <pre className="mt-2 overflow-auto text-xs text-amber-200/80">
            {JSON.stringify(shareholder, null, 2)}
          </pre>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('shareholder');
            window.location.href = '/login';
          }}
          className="mt-8 w-full rounded-2xl bg-red-400/20 py-4 font-bold text-red-300"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
