'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 格式化手机号（支持 +60 前缀或纯数字）
  const formatPhone = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    // 如果用户输入了 +60，保持不变
    if (value.startsWith('+60')) {
      return value;
    }
    // 如果数字以 60 开头，添加 +
    if (numeric.startsWith('60')) {
      return '+' + numeric;
    }
    // 如果数字以 0 开头，替换为 +60
    if (numeric.startsWith('0')) {
      return '+60' + numeric.slice(1);
    }
    // 否则添加 +60
    return '+60' + numeric;
  };

  // 密码登录
  const handleLogin = async () => {
    if (!phone || phone.length < 12) {
      setError('请输入有效的手机号');
      return;
    }
    if (!password || password.length < 6) {
      setError('请输入密码（至少6位）');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登录失败');
        return;
      }

      // 先清除旧的缓存数据
      localStorage.removeItem('shareholder');
      localStorage.removeItem('shareholder_phone');
      localStorage.removeItem('token');
      
      // 保存新的 token、股东信息和手机号
      localStorage.setItem('token', data.token);
      localStorage.setItem('shareholder', JSON.stringify(data.shareholder));
      localStorage.setItem('shareholder_phone', data.shareholder.phone);

      // 跳转到首页
      window.location.href = '/';
    } catch (err) {
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
              <h1 className="text-xl font-black text-white">Shareholder Lifestyle</h1>
            </div>
          </div>
          
          <h2 className="mt-8 text-3xl font-black text-white">股东登录</h2>
          <p className="mt-2 text-sm text-white/60">请输入您的手机号和密码</p>
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
            <label className="mb-2 block text-sm font-medium text-white/80">手机号</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">+60</span>
              <input
                type="tel"
                value={phone.replace('+60', '')}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="123456789"
                maxLength={11}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <p className="mt-2 text-xs text-white/40">例如：123456789</p>
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
            disabled={loading || phone.length < 12 || password.length < 6}
            className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm text-amber-200">
              <span className="font-bold">提示：</span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-200/80">
              <li>• 默认密码为 123456</li>
              <li>• 登录后可在设置中修改密码</li>
              <li>• 如有问题请联系管理员</li>
            </ul>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/40">
            Snowy Fox District Six Entertainment Sdn Bhd
          </p>
          <p className="mt-1 text-xs text-white/30">
            股东专属应用 · 仅限授权用户
          </p>
        </div>
      </div>
    </div>
  );
}
