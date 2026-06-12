'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { formatRM, formatDateTime } from '@/lib/utils';

interface RedemptionRecord {
  id: number;
  shareholder_name: string;
  member_no: string;
  family_card_name?: string;
  food_amount_rm: number;
  alcohol_amount_rm: number;
  points_deducted: number;
  final_pay_rm: number;
  created_at: string;
}

// Mock data
const mockHistory: RedemptionRecord[] = [
  {
    id: 1,
    shareholder_name: 'MR. LEE WEN CHUIN',
    member_no: 'SFD6-FP-001',
    food_amount_rm: 350,
    alcohol_amount_rm: 200,
    points_deducted: 125,
    final_pay_rm: 425,
    created_at: '2026-06-12T14:30:00',
  },
  {
    id: 2,
    shareholder_name: 'MR. LEE WEN CHUIN',
    member_no: 'SFD6-FP-001',
    family_card_name: '李太太',
    food_amount_rm: 280,
    alcohol_amount_rm: 0,
    points_deducted: 84,
    final_pay_rm: 196,
    created_at: '2026-06-12T12:15:00',
  },
  {
    id: 3,
    shareholder_name: 'MS. TAN MEI LING',
    member_no: 'SFD6-CR-002',
    food_amount_rm: 500,
    alcohol_amount_rm: 300,
    points_deducted: 180,
    final_pay_rm: 620,
    created_at: '2026-06-11T20:45:00',
  },
  {
    id: 4,
    shareholder_name: 'MR. LEE WEN CHUIN',
    member_no: 'SFD6-FP-001',
    food_amount_rm: 150,
    alcohol_amount_rm: 100,
    points_deducted: 55,
    final_pay_rm: 195,
    created_at: '2026-06-10T19:20:00',
  },
  {
    id: 5,
    shareholder_name: 'MR. WONG KAI MING',
    member_no: 'SFD6-ST-003',
    family_card_name: '王小明',
    food_amount_rm: 200,
    alcohol_amount_rm: 150,
    points_deducted: 75,
    final_pay_rm: 275,
    created_at: '2026-06-10T18:00:00',
  },
];

export default function CashierHistory() {
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = mockHistory.filter(record => {
    if (searchQuery) {
      return (
        record.shareholder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.member_no.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const totalRevenue = filteredHistory.reduce((sum, r) => sum + r.final_pay_rm, 0);
  const totalPoints = filteredHistory.reduce((sum, r) => sum + r.points_deducted, 0);
  const totalTransactions = filteredHistory.length;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">History</p>
            <h1 className="mt-1 text-2xl font-black text-white">核销记录</h1>
          </div>
          <button 
            onClick={() => window.location.href = '/cashier/dashboard'}
            className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <Icon name="scan" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-28 pt-6">
        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs text-white/50">今日核销</p>
            <p className="mt-1 text-xl font-bold text-white">{totalTransactions}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs text-white/50">积分抵扣</p>
            <p className="mt-1 text-xl font-bold text-emerald-300">{totalPoints}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs text-white/50">实收金额</p>
            <p className="mt-1 text-xl font-bold text-amber-300">{formatRM(totalRevenue)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {(['today', 'week', 'month', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {f === 'today' && '今日'}
              {f === 'week' && '本周'}
              {f === 'month' && '本月'}
              {f === 'all' && '全部'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索股东姓名或编号..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
            />
            <Icon name="scan" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{record.shareholder_name}</h3>
                    {record.family_card_name && (
                      <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs text-amber-300">
                        {record.family_card_name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-white/50">{record.member_no}</p>
                  <p className="mt-2 text-xs text-white/40">{formatDateTime(record.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-300">{formatRM(record.final_pay_rm)}</p>
                  <p className="mt-1 text-xs text-emerald-300">-{record.points_deducted} 分</p>
                </div>
              </div>
              
              <div className="mt-3 flex gap-4 border-t border-white/10 pt-3 text-xs text-white/50">
                <span>食物: {formatRM(record.food_amount_rm)}</span>
                <span>酒精: {formatRM(record.alcohol_amount_rm)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHistory.length === 0 && (
          <div className="py-12 text-center">
            <Icon name="history" className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <p className="text-white/50">暂无核销记录</p>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-transparent py-4 font-bold text-white hover:bg-white/5">
            <Icon name="list" className="h-5 w-5" />
            导出日报表 (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}