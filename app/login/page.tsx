'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | undefined>();

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

  // 发送 OTP
  const handleSendOTP = async () => {
    if (!phone || phone.length < 12) {
      alert('请输入有效的手机号');
      return;
    }

    setLoading(true);
    console.log('Sending OTP request to /api/auth/otp with phone:', phone);
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      console.log('OTP response status:', response.status);
      const data = await response.json();
      console.log('OTP response data:', data);

      if (!response.ok) {
        alert(data.error || '发送失败');
        return;
      }

      // 显示 OTP（用于测试）
      if (data.debug_otp) {
        setDebugOtp(data.debug_otp);
      } else if (data.code) {
        setDebugOtp(data.code);
      }

      setStep('otp');
      setCountdown(60); // 60 秒倒计时
      
      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Send OTP error:', error);
      alert('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 验证 OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('请输入6位验证码');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '验证失败');
        setOtp('');
        return;
      }

      // 保存 token 和股东信息
      localStorage.setItem('token', data.token);
      localStorage.setItem('shareholder', JSON.stringify(data.shareholder));

      // 跳转到首页
      window.location.href = '/';
    } catch (error) {
      console.error('Verify OTP error:', error);
      alert('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 重新发送 OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
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
            {step === 'phone' ? '股东登录' : '输入验证码'}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {step === 'phone' 
              ? '请输入您的手机号' 
              : `验证码已发送至 ${phone}`}
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
                  maxLength={11}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <p className="mt-2 text-xs text-white/40">例如：123456789</p>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading || phone.length < 12}
              className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? '发送中...' : '获取验证码'}
            </button>

            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm text-amber-200">
                <span className="font-bold">安全提示：</span>
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-200/80">
                <li>• 验证码将通过 WhatsApp 发送</li>
                <li>• 验证码 5 分钟内有效</li>
                <li>• 请勿将验证码告知他人</li>
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
              <label className="mb-2 block text-sm font-medium text-white/80">验证码</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              
              {/* 开发环境显示 OTP */}
              {debugOtp && (
                <p className="mt-2 text-center text-sm text-amber-300">
                  开发环境验证码：{debugOtp}
                </p>
              )}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? '验证中...' : '登录'}
            </button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setDebugOtp(undefined);
                }}
                className="text-sm text-white/60 hover:text-white"
              >
                更换手机号
              </button>
              <button
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                className="text-sm font-medium text-emerald-400 disabled:text-white/40"
              >
                {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
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
