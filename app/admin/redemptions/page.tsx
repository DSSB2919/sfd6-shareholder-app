'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { formatRM } from '@/lib/utils';
import { supabase, RECEIPTS_BUCKET, getRedemptions, updateRedemptionStatus, deleteRedemption, type Redemption } from '@/lib/supabase';

interface Redemption {
  id: string;
  shareholder_id: number;
  shareholder_name: string;
  shareholder_member_no: string;
  food_amount: number;
  alcohol_amount: number;
  total_deduct: number;
  final_pay: number;
  receipt_url: string | null;
  receipt_path: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
}



export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch from database
  useEffect(() => {
    loadRedemptions();
  }, []);

  const loadRedemptions = async () => {
    setLoading(true);
    const data = await getRedemptions();
    setRedemptions(data);
    setLoading(false);
  };

  const filteredRedemptions = redemptions.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pendingCount = redemptions.filter(r => r.status === 'pending').length;
  const verifiedCount = redemptions.filter(r => r.status === 'verified').length;

  const handleVerify = async (redemption: Redemption, status: 'verified' | 'rejected') => {
    const success = await updateRedemptionStatus(redemption.id, status, 'admin');
    
    if (success) {
      if (status === 'verified') {
        alert('已标记为已核实');
      } else {
        // Delete receipt if rejected
        if (redemption.receipt_path) {
          await supabase.storage.from(RECEIPTS_BUCKET).remove([redemption.receipt_path]);
        }
        alert('已拒绝并删除照片');
      }
      
      // Refresh list
      await loadRedemptions();
      setShowDetailModal(false);
      setSelectedRedemption(null);
    } else {
      alert('操作失败，请重试');
    }
  };

  const handleDeleteReceipt = async (redemption: Redemption) => {
    if (!redemption.receipt_path) return;
    
    const confirmed = confirm('确定要删除这张照片吗？');
    if (!confirmed) return;

    const success = await deleteRedemption(redemption.id, redemption.receipt_path);

    if (success) {
      await loadRedemptions();
      setShowDetailModal(false);
      setSelectedRedemption(null);
      alert('照片已删除');
    } else {
      alert('删除失败，请重试');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-300">待核实</span>;
      case 'verified':
        return <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-300">已核实</span>;
      case 'rejected':
        return <span className="rounded-full bg-red-400/20 px-2 py-1 text-xs text-red-300">已拒绝</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Admin</p>
            <h1 className="mt-1 text-2xl font-black text-white">核销记录</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/shareholders"
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              股东管理
            </a>
            <button className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20">
              <Icon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28 pt-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">待核实</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">已核实</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{verifiedCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">总计</p>
            <p className="mt-1 text-2xl font-bold text-white">{redemptions.length}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'verified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                filter === f
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待核实' : '已核实'}
            </button>
          ))}
        </div>

        {/* Redemptions List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div>
              <span className="text-sm text-white/60">加载中...</span>
            </div>
          </div>
        ) : filteredRedemptions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <Icon name="list" className="mx-auto mb-3 h-12 w-12 text-white/20" />
            <p className="text-white/60">暂无记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRedemptions.map((redemption, index) => (
              <motion.div
                key={redemption.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedRedemption(redemption);
                  setShowDetailModal(true);
                }}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{redemption.shareholder_name}</h3>
                      {getStatusBadge(redemption.status)}
                    </div>
                    <p className="mt-1 text-xs text-white/50">{redemption.shareholder_member_no}</p>
                    <p className="mt-1 text-xs text-white/40">{formatDate(redemption.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-300">{formatRM(redemption.final_pay)}</p>
                    <p className="text-xs text-white/50">实付</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex gap-3 text-xs text-white/60">
                    <span>食物: {formatRM(redemption.food_amount)}</span>
                    <span>酒精: {formatRM(redemption.alcohol_amount)}</span>
                  </div>
                  <span className="text-xs text-emerald-300">抵扣 {redemption.total_deduct} 分</span>
                </div>
                
                {redemption.receipt_url && (
                  <div className="mt-3">
                    <span className="rounded-full bg-blue-400/20 px-2 py-1 text-xs text-blue-300">
                      有照片
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">核销详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            
            {/* Status */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-white/60">状态</span>
              {getStatusBadge(selectedRedemption.status)}
            </div>
            
            {/* Shareholder Info */}
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-bold text-white">{selectedRedemption.shareholder_name}</h3>
              <p className="text-sm text-white/50">{selectedRedemption.shareholder_member_no}</p>
              <p className="mt-2 text-xs text-white/40">
                核销时间: {formatDate(selectedRedemption.created_at)}
              </p>
            </div>
            
            {/* Amount Details */}
            <div className="mb-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">食物/无酒精</span>
                <span className="text-white">{formatRM(selectedRedemption.food_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">酒精饮料</span>
                <span className="text-white">{formatRM(selectedRedemption.alcohol_amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-300">
                <span>积分抵扣</span>
                <span>-{selectedRedemption.total_deduct} 分</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-white">实付金额</span>
                <span className="text-xl font-bold text-amber-300">{formatRM(selectedRedemption.final_pay)}</span>
              </div>
            </div>
            
            {/* Receipt Image */}
            <div className="mb-4">
              <h3 className="mb-2 font-bold text-white">单据照片</h3>
              {selectedRedemption.receipt_url ? (
                <div className="relative">
                  <img
                    src={selectedRedemption.receipt_url}
                    alt="Receipt"
                    className="w-full rounded-2xl"
                  />
                  <button
                    onClick={() => handleDeleteReceipt(selectedRedemption)}
                    className="absolute right-2 top-2 rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-sm text-white/40">无照片</p>
                </div>
              )}
            </div>
            
            {/* Verification Info */}
            {selectedRedemption.verified_at && (
              <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-300">
                  核实时间: {formatDate(selectedRedemption.verified_at)}
                </p>
                <p className="text-sm text-emerald-300/70">
                  核实人: {selectedRedemption.verified_by}
                </p>
              </div>
            )}
            
            {/* Actions */}
            {selectedRedemption.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleVerify(selectedRedemption, 'rejected')}
                  className="rounded-xl border border-red-400/50 bg-red-400/10 py-3 font-bold text-red-400 hover:bg-red-400/20"
                >
                  拒绝
                </button>
                <button
                  onClick={() => handleVerify(selectedRedemption, 'verified')}
                  className="rounded-xl bg-emerald-400 py-3 font-bold text-zinc-950 hover:bg-emerald-300"
                >
                  确认核实
                </button>
              </div>
            )}
            
            {selectedRedemption.status === 'verified' && (
              <button
                onClick={() => handleDeleteReceipt(selectedRedemption)}
                className="w-full rounded-xl border border-white/20 bg-transparent py-3 font-bold text-white hover:bg-white/5"
              >
                删除照片
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
