'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      alert('请输入当前密码');
      return;
    }
    if (newPassword.length < 6) {
      alert('新密码至少需要6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }
    if (newPassword === currentPassword) {
      alert('新密码不能与当前密码相同');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Settings</p>
            <h1 className="mt-1 text-2xl font-black text-white">设置</h1>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-28 pt-6">
        {/* Security Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">安全设置</h2>
          
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-bold text-white">修改密码</h3>
            <p className="mt-1 text-sm text-white/50">定期更换密码可以提高账户安全性</p>
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl bg-emerald-400/20 p-3 text-center"
              >
                <p className="text-sm font-bold text-emerald-300">✓ 密码修改成功</p>
              </motion.div>
            )}
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/60">当前密码</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm text-white/60">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少6位字符"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm text-white/60">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
            
            <button
              onClick={handleChangePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="mt-5 w-full rounded-xl bg-emerald-400 py-4 font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? '修改中...' : '修改密码'}
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">账户</h2>
          
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">退出登录</h3>
                <p className="mt-1 text-sm text-white/50">退出当前账户</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-400/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-400/30"
              >
                退出
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">关于</h2>
          
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/20">
                <Icon name="snow" className="h-8 w-8 text-emerald-300" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">SFD6 Shareholder App</h3>
              <p className="mt-1 text-sm text-white/50">版本 1.0.0</p>
              <p className="mt-4 text-xs text-white/30">
                Snowy Fox District Six Entertainment Sdn Bhd<br />
                股东专属应用 · 仅限授权用户
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
