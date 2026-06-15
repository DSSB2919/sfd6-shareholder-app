'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'verify' | 'change'>('verify');

  const handleVerifyCurrent = async () => {
    if (currentPassword !== '123456') {
      alert('当前密码错误，请重新输入');
      return;
    }
    setStep('change');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      alert('新密码至少需要6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }
    if (newPassword === '123456') {
      alert('新密码不能与默认密码相同');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    alert('密码修改成功！请使用新密码重新登录。');
    window.location.href = '/login';
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
            {step === 'verify' ? '安全验证' : '修改密码'}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {step === 'verify'
              ? '首次登录需要验证当前密码'
              : '请设置您的新密码'}
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8">
        {step === 'verify' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
              <div className="flex items-center gap-2">
                <Icon name="shield" className="h-5 w-5 text-red-300" />
                <p className="text-sm font-bold text-red-300">安全警告</p>
              </div>
              <p className="mt-2 text-xs text-red-200/80">
                您正在使用默认密码登录。为了账户安全，请立即修改密码。
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">当前密码</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="请输入默认密码 123456"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <p className="mt-2 text-xs text-white/40">默认密码：123456</p>
            </div>

            <button
              onClick={handleVerifyCurrent}
              className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300"
            >
              验证并继续
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少6位字符"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-2 text-xs text-white/50">
              <p>• 密码至少需要6位</p>
              <p>• 不能与默认密码相同</p>
              <p>• 请妥善保管您的密码</p>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? '修改中...' : '确认修改'}
            </button>
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
