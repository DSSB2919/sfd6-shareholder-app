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
  });

  const filteredShareholders = shareholders.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.member_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  // 获取股东列表
  useEffect(() => {
    fetchShareholders();
  }, []);

  const fetchShareholders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shareholders'); // 获取所有股东
      if (!response.ok) {
        throw new Error('Failed to fetch shareholders');
      }
      const data = await response.json();
      setShareholders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        // Update existing - 调用 PUT /api/shareholder
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
        // Add new - 调用 POST /api/shareholders
        const response = await fetch('/api/shareholders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || '添加失败');
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
    });
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
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        
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
            className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-6"
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-white/60">股份 %</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.share_percent}
                    onChange={(e) => {
                      const share = parseInt(e.target.value) || 1;
                      const investment = share * 9600;
                      setFormData({ 
                        ...formData, 
                        share_percent: share,
                        actual_investment_rm: investment,
                        points_balance: investment,
                      });
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
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
                <p className="mt-1 text-xs text-white/40">
                  等级: {getTierByShare(formData.share_percent)} | 
                  每周积分: {getWeeklyPointsByTier(getTierByShare(formData.share_percent))}
                </p>
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