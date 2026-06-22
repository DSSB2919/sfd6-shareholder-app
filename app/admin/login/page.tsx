'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登录失败');
        return;
      }

      // 保存 token
      localStorage.setItem('admin_token', data.token);
      // 跳转到管理后台
      window.location.href = '/admin';
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-6 pb-12 pt-16">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-amber-300/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Icon name="snow" className="h-8 w-8 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Snowy Fox</p>
              <h1 className="text-xl font-black text-white">Admin System</h1>
            </div>
          </div>

          <h2 className="mt-8 text-3xl font-black text-white">管理员登录</h2>
          <p className="mt-2 text-sm text-white/60">
            仅限授权人员访问
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {error && (
            <div className="rounded-xl bg-red-400/20 p-3 text-center">
              <p className="text-sm font-bold text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入管理员账号"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm text-amber-200">
              <span className="font-bold">默认账号：</span>
            </p>
            <p className="mt-1 text-xs text-amber-200/80">
              用户名: admin<br />
              密码: admin123
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/40">
            Snowy Fox District Six Entertainment Sdn Bhd
          </p>
          <p className="mt-1 text-xs text-white/30">
            管理系统 · 仅限授权用户
          </p>
        </div>
      </div>
    </div>
  );
}
