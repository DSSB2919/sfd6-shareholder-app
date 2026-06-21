'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { formatRM, getTierByShare, getWeeklyPointsByTier, generateMemberNo, generateReferralCode } from '@/lib/utils';
import type { Shareholder } from '@/types';

export default function AdminShareholders() {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    share_percent: 1,
    actual_investment_rm: 9600,
    points_balance: 9600,
    member_no: '',
    referral_code: '',
  });

  // 股份输入的字符串状态（支持小数输入）
  const [sharePercentInput, setSharePercentInput] = useState('1');

  const filteredShareholders = shareholders.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.member_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  // 从 Supabase 加载数据（优先）
  useEffect(() => {
    fetchShareholders();
  }, []);

  // 保存到 LocalStorage
  useEffect(() => {
    localStorage.setItem('sfd6_shareholders', JSON.stringify(shareholders));
  }, [shareholders]);

  const fetchShareholders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shareholders');
      if (!response.ok) {
        throw new Error('Failed to fetch shareholders');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setShareholders(data);
      }
    } catch (err) {
      console.warn('API fetch failed, using local data:', err);
      // API 失败时保持 LocalStorage 数据
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // 开发环境：直接操作本地状态
      const isDev = process.env.NODE_ENV === 'development';
      
      if (editingId) {
        // Update existing - 调用 API
        const response = await fetch('/api/shareholder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...formData,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || '更新失败');
          return;
        }

        const updatedShareholder = await response.json();
        setShareholders(shareholders.map(s =>
          s.id === editingId ? updatedShareholder : s
        ));
      } else {
        // Add new - 调用 API
        const response = await fetch('/api/shareholders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          alert(`保存失败: ${errorData.error}`);
          return;
        }

        const newShareholder = await response.json();
        setShareholders([newShareholder, ...shareholders]);
      }
      closeModal();
    } catch (err) {
      alert('操作失败，请重试');
    }
  };

  const handleEdit = (shareholder: Shareholder) => {
    setEditingId(shareholder.id);
    setFormData({
      name: shareholder.name,
      phone: shareholder.phone,
      email: shareholder.email || '',
      share_percent: shareholder.share_percent,
      actual_investment_rm: shareholder.actual_investment_rm,
      points_balance: shareholder.points_balance,
      member_no: shareholder.member_no,
      referral_code: shareholder.referral_code,
    });
    setSharePercentInput(String(shareholder.share_percent));
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      share_percent: 1,
      actual_investment_rm: 9600,
      points_balance: 9600,
      member_no: '',
      referral_code: '',
    });
    setSharePercentInput('1');
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        
        {/* Back Button */}
        <div className="relative mb-4">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Icon name="chevron" className="h-4 w-4 rotate-180" />
            返回管理后台
          </a>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Admin</p>
            <h1 className="mt-1 text-2xl font-black text-white">股东管理</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/redemptions"
              className="rounded-2xl bg-amber-400/20 px-4 py-2 text-sm font-bold text-amber-300 hover:bg-amber-400/30"
            >
              核销记录
            </a>
            <button className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20">
              <Icon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28 pt-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
              <p className="text-white/60">加载中...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <p className="text-white">加载失败</p>
              <p className="mt-2 text-sm text-white/60">{error}</p>
              <button
                onClick={fetchShareholders}
                className="mt-4 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-300"
              >
                重新加载
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/50">总股东数</p>
                <p className="mt-1 text-2xl font-bold text-white">{shareholders.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/50">总积分发放</p>
                <p className="mt-1 text-2xl font-bold text-emerald-300">
                  {shareholders.reduce((sum, s) => sum + s.points_balance, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Search & Add */}
            <div className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索股东..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-2xl bg-emerald-400 px-4 py-3 font-bold text-zinc-950 hover:bg-emerald-300"
              >
                <Icon name="plus" className="h-5 w-5" />
              </button>
            </div>

            {/* Shareholders List */}
            <div className="space-y-3">
              {filteredShareholders.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-white/40">暂无股东数据</p>
                </div>
              ) : (
                filteredShareholders.map((shareholder, index) => (
            <motion.div
              key={shareholder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleEdit(shareholder)}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{shareholder.name}</h3>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-300">
                      {shareholder.share_percent}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">{shareholder.member_no}</p>
                  <p className="mt-1 text-xs text-white/40">{shareholder.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-300">
                    {shareholder.points_balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/50">积分</p>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs text-amber-300">{shareholder.tier}</span>
                <span className="text-xs text-white/40">{formatRM(shareholder.actual_investment_rm)}</span>
              </div>
            </motion.div>
              ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-6"
          >
            <h2 className="text-xl font-bold text-white">
              {editingId ? '编辑股东' : '添加股东'}
            </h2>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/60">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm text-white/60">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm text-white/60">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              {/* 股份选择 - 更直观的按钮选择 */}
              <div>
                <label className="mb-2 block text-sm text-white/60">股份等级</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { share: 1, label: '1%', desc: 'Support' },
                    { share: 3, label: '3%', desc: 'Lifestyle' },
                    { share: 5, label: '5%', desc: 'Strategic' },
                    { share: 10, label: '10%', desc: 'Core' },
                    { share: 20, label: '20%', desc: 'Founding' },
                    { share: 0, label: '自定义', desc: 'Other' },
                  ].map((option) => (
                    <button
                      key={option.share}
                      type="button"
                      onClick={() => {
                        if (option.share === 0) return; // 自定义不处理
                        const investment = option.share * 9600;
                        setSharePercentInput(String(option.share));
                        setFormData({
                          ...formData,
                          share_percent: option.share,
                          actual_investment_rm: investment,
                          points_balance: investment,
                        });
                      }}
                      className={`rounded-xl px-3 py-2 text-xs transition ${
                        formData.share_percent === option.share
                          ? 'bg-emerald-400 text-zinc-950 font-bold'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div>{option.label}</div>
                      <div className="text-[10px] opacity-70">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-white/60">股份 %</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={sharePercentInput}
                    onChange={(e) => {
                      // 允许输入小数
                      const value = e.target.value;
                      // 只允许数字和小数点
                      if (/^\d*\.?\d*$/.test(value)) {
                        setSharePercentInput(value);
                        const share = parseFloat(value) || 0;
                        const investment = Math.round(share * 9600);
                        setFormData({
                          ...formData,
                          share_percent: share,
                          actual_investment_rm: investment,
                          points_balance: investment,
                        });
                      }
                    }}
                    placeholder="如: 15.294"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">实际投资 (RM)</label>
                  <input
                    type="number"
                    value={formData.actual_investment_rm}
                    onChange={(e) => setFormData({
                      ...formData,
                      actual_investment_rm: parseInt(e.target.value) || 0
                    })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/60">初始积分</label>
                <input
                  type="number"
                  value={formData.points_balance}
                  onChange={(e) => setFormData({
                    ...formData,
                    points_balance: parseInt(e.target.value) || 0
                  })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* 会员编号和推荐码 - 可手动编辑 */}
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <h4 className="text-sm font-bold text-amber-300">会员信息（可手动编辑）</h4>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-white/60">会员编号</label>
                    <input
                      type="text"
                      value={formData.member_no}
                      onChange={(e) => setFormData({ ...formData, member_no: e.target.value })}
                      placeholder={editingId ? formData.member_no : "留空自动生成，如: SFD6-FP-001"}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/60">推荐码</label>
                    <input
                      type="text"
                      value={formData.referral_code}
                      onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                      placeholder={editingId ? formData.referral_code : "留空自动生成，如: SFD6-FP-001-2026"}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 自动计算的信息预览 */}
              <div className="rounded-xl bg-emerald-400/10 p-4">
                <h4 className="text-sm font-bold text-emerald-300">自动计算的信息</h4>
                <div className="mt-2 space-y-1 text-xs text-white/70">
                  <p>股东等级: <span className="text-white">{getTierByShare(formData.share_percent)}</span></p>
                  <p>每周积分: <span className="text-white">{getWeeklyPointsByTier(getTierByShare(formData.share_percent))} 分</span></p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl border border-white/20 bg-transparent py-3 font-bold text-white hover:bg-white/5"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.phone}
                className="flex-1 rounded-xl bg-emerald-400 py-3 font-bold text-zinc-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {editingId ? '保存' : '添加'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}