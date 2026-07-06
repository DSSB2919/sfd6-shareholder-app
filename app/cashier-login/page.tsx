'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

export default function CashierLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('请输入用户名和密码');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/cashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '登录失败');
        return;
      }

      // 清除旧数据
      localStorage.removeItem('cashier_token');
      localStorage.removeItem('cashier');
      localStorage.removeItem('cashier_token_expiry');
      
      // 保存新的 token 和收银员信息
      localStorage.setItem('cashier_token', data.token);
      localStorage.setItem('cashier', JSON.stringify(data.cashier));
      
      // 解析 token 获取过期时间并保存
      try {
        const payload = JSON.parse(atob(data.token));
        if (payload.exp) {
          localStorage.setItem('cashier_token_expiry', payload.exp.toString());
        }
      } catch {
        // 解析失败，使用默认 10 分钟后过期
        localStorage.setItem('cashier_token_expiry', (Date.now() + 10 * 60 * 1000).toString());
      }

      // 跳转到收银台
      window.location.href = '/cashier/dashboard';
    } catch (err) {
      alert('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 px-6 pb-12 pt-16">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-emerald-300/10 blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Icon name="snow" className="h-8 w-8 text-amber-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Snowy Fox</p>
              <h1 className="text-xl font-black text-white">Cashier Portal</h1>
            </div>
          </div>
          
          <h2 className="mt-8 text-3xl font-black text-white">收银员登录</h2>
          <p className="mt-2 text-sm text-white/60">
            请输入您的账号密码进入核销系统
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
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cashier"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl bg-amber-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">
              <span className="font-bold text-white">默认账号：</span>cashier / cashier123
            </p>
            <p className="mt-1 text-xs text-white/40">
              如需重置密码，请联系管理员
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/40">
            Snowy Fox District Six Entertainment Sdn Bhd
          </p>
          <p className="mt-1 text-xs text-white/30">
            内部使用 · 未经授权禁止访问
          </p>
        </div>
      </div>
    </div>
  );
}