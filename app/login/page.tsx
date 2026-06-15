'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'password'>('phone');
  const [loading, setLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const handleCheckPhone = async () => {
    if (!phone || phone.length < 10) {
      alert('请输入有效的手机号');
      return;
    }
    
    setLoading(true);
    // Simulate API call - check if phone exists and if first login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock: check if this is first login (password is default 123456)
    // In real implementation, API should return: { exists: true, isFirstLogin: boolean }
    const mockIsFirstLogin = phone === '+60123456789'; // Example
    setIsFirstLogin(mockIsFirstLogin);
    
    setStep('password');
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!password) {
      alert('请输入密码');
      return;
    }
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if password is default 123456
    if (password === '123456') {
      // Redirect to change password page
      window.location.href = '/change-password';
      return;
    }
    
    // Normal login
    console.log('Login success', phone, password);
    window.location.href = '/';
  };

  const formatPhone = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (numeric.startsWith('60')) {
      return '+' + numeric;
    }
    if (numeric.startsWith('0')) {
      return '+60' + numeric.slice(1);
    }
    return '+60' + numeric;
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
          
          <h2 className="mt-8 text-3xl font-black text-white">
            {step === 'phone' ? '股东登录' : '输入密码'}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {step === 'phone' 
              ? '请输入您的手机号' 
              : `欢迎回来，${phone}`}
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8">
        {step === 'phone' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">手机号</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">+60</span>
                <input
                  type="tel"
                  value={phone.replace('+60', '')}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="123456789"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <p className="mt-2 text-xs text-white/40">例如：123456789</p>
            </div>

            <button
              onClick={handleCheckPhone}
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? '检查中...' : '下一步'}
            </button>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm text-amber-200">
                <span className="font-bold">安全提示：</span>
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-200/80">
                <li>• 首次登录默认密码为 123456</li>
                <li>• 登录后系统会强制要求修改密码</li>
                <li>• 请设置6位以上强密码</li>
                <li>• 请勿将密码告知他人</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              {isFirstLogin && (
                <p className="mt-2 text-xs text-amber-300">
                  首次登录，默认密码：123456
                </p>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('phone')}
                className="text-sm text-white/60 hover:text-white"
              >
                更换手机号
              </button>
              <button
                onClick={() => alert('请联系管理员重置密码')}
                className="text-sm font-medium text-emerald-400"
              >
                忘记密码？
              </button>
            </div>
          </motion.div>
        )}

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
