'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

interface TableData {
  name: string;
  count: number;
  data: any[];
  loading: boolean;
  error: string | null;
}

export default function DataViewer() {
  const [tables, setTables] = useState<Record<string, TableData>>({
    shareholders: { name: '股东表', count: 0, data: [], loading: true, error: null },
    weekly_points_usage: { name: '每周积分使用', count: 0, data: [], loading: true, error: null },
    redemptions: { name: '核销记录', count: 0, data: [], loading: true, error: null },
    family_cards: { name: '家属副卡', count: 0, data: [], loading: true, error: null },
    cashiers: { name: '收银员', count: 0, data: [], loading: true, error: null },
  });
  const [activeTab, setActiveTab] = useState('shareholders');
  const [searchTerm, setSearchTerm] = useState('');

  // 加载所有表数据
  useEffect(() => {
    const fetchData = async () => {
      // 获取股东数据
      try {
        const response = await fetch('/api/shareholders?active=false');
        if (response.ok) {
          const data = await response.json();
          setTables(prev => ({
            ...prev,
            shareholders: { ...prev.shareholders, data, count: data.length, loading: false }
          }));
        }
      } catch (error) {
        setTables(prev => ({
          ...prev,
          shareholders: { ...prev.shareholders, error: '加载失败', loading: false }
        }));
      }

      // 获取核销记录
      try {
        const response = await fetch('/api/redemptions');
        if (response.ok) {
          const data = await response.json();
          setTables(prev => ({
            ...prev,
            redemptions: { ...prev.redemptions, data, count: data.length, loading: false }
          }));
        }
      } catch (error) {
        setTables(prev => ({
          ...prev,
          redemptions: { ...prev.redemptions, error: '加载失败', loading: false }
        }));
      }

      // TODO: 添加其他表的 API 端点
      setTables(prev => ({
        ...prev,
        weekly_points_usage: { ...prev.weekly_points_usage, loading: false },
        family_cards: { ...prev.family_cards, loading: false },
        cashiers: { ...prev.cashiers, loading: false },
      }));
    };

    fetchData();
  }, []);

  const activeTable = tables[activeTab];
  
  // 过滤数据
  const filteredData = activeTable?.data?.filter((row: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  }) || [];

  // 计算统计数据
  const stats = {
    totalShareholders: tables.shareholders.count,
    totalRedemptions: tables.redemptions.count,
    totalPoints: tables.shareholders.data?.reduce((sum: number, s: any) => sum + (s.points_balance || 0), 0) || 0,
    totalInvestment: tables.shareholders.data?.reduce((sum: number, s: any) => sum + (s.actual_investment_rm || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-8 pt-12">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2">
            <a href="/admin" className="text-sm text-white/50 hover:text-white">
              ← 返回管理后台
            </a>
          </div>
          <h1 className="mt-4 text-3xl font-black text-white">数据查看器</h1>
          <p className="mt-2 text-sm text-white/60">查看所有存储的数据表</p>
        </div>
      </div>

      <div className="px-5 pb-28 pt-6">
        {/* 统计卡片 */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
            <p className="text-xs text-emerald-300">总股东数</p>
            <p className="mt-1 text-2xl font-black text-white">{stats.totalShareholders}</p>
          </div>
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="text-xs text-amber-300">总核销数</p>
            <p className="mt-1 text-2xl font-black text-white">{stats.totalRedemptions}</p>
          </div>
          <div className="rounded-2xl border border-blue-400/30 bg-blue-400/10 p-4">
            <p className="text-xs text-blue-300">总积分余额</p>
            <p className="mt-1 text-lg font-black text-white">{(stats.totalPoints || 0).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-4">
            <p className="text-xs text-purple-300">总投资额</p>
            <p className="mt-1 text-lg font-black text-white">RM {(stats.totalInvestment || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* 表选择标签 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(tables).map(([key, table]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === key
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {table.name}
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {table.count}
              </span>
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="搜索数据..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 py-3 pl-12 pr-4 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 数据表格 */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          {activeTable?.loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
                <p className="text-white/60">加载中...</p>
              </div>
            </div>
          ) : activeTable?.error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
                <p className="text-white">{activeTable.error}</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-white/60">暂无数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {Object.keys(filteredData[0]).map((key) => (
                      <th key={key} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row: any, index: number) => (
                    <motion.tr
                      key={row.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      {Object.values(row).map((value: any, i: number) => (
                        <td key={i} className="px-4 py-3 text-white/80">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-300">是</span>
                            ) : (
                              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/50">否</span>
                            )
                          ) : value === null ? (
                            <span className="text-white/30">-</span>
                          ) : (
                            String(value).substring(0, 50)
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 数据说明 */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-bold text-white">数据说明</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>• 股东表: 存储所有股东的基本信息、积分余额、等级等</li>
            <li>• 每周积分使用: 记录每位股东每周的积分使用状态</li>
            <li>• 核销记录: 存储所有消费核销的历史记录</li>
            <li>• 家属副卡: 股东的家属副卡信息</li>
            <li>• 收银员: 收银员和管理员账户信息</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
