'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { NetworkStatus } from '@/components/NetworkStatus';
import { BENEFITS, TIERS, ACTIVITY_REWARDS } from '@/types';
import { formatRM, calculateFoodDeduct, calculateAlcoholDeduct, calculateReferralReward, getDeductPointsByTier } from '@/lib/utils';
import { ShareholderProvider, useShareholder } from './context/ShareholderContext';
import { AuthGuard } from '@/components/AuthGuard';

// Weekly Points 状态类型
interface WeeklyPointsStatus {
  shareholder_id: number;
  year: number;
  week_number: number;
  used: boolean;
  used_at?: string;
  week_range: { start: string; end: string };
}

// 获取本周日期范围
function getWeekRange(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

function HomeScreen({ setActive, onShowQR }: { setActive: (id: string) => void; onShowQR: () => void; }) {
  const weekRange = getWeekRange();
  const { shareholder, loading: loadingShareholder, error: shareholderError } = useShareholder();
  const [showQRLocal, setShowQRLocal] = useState(false);
  const [weeklyPoints, setWeeklyPoints] = useState<WeeklyPointsStatus | null>(null);
  const [loadingWeeklyPoints, setLoadingWeeklyPoints] = useState(true);

  // 安全地获取数值
  const pointsBalance = shareholder?.points_balance ?? 0;
  const weeklyPointsValue = shareholder?.weekly_points ?? 0;
  const sharePercent = shareholder?.share_percent ?? 0;
  const tier = shareholder?.tier ?? 'Unknown';

  useEffect(() => {
    if (!shareholder) return;

    const fetchWeeklyPoints = async () => {
      try {
        const response = await fetch(`/api/weekly-points?shareholder_id=${shareholder.id}`);
        if (response.ok) {
          const data = await response.json();
          setWeeklyPoints(data);
        }
      } catch (error) {
        console.error('Failed to fetch weekly points:', error);
      } finally {
        setLoadingWeeklyPoints(false);
      }
    };

    fetchWeeklyPoints();
    const interval = setInterval(fetchWeeklyPoints, 30000);
    return () => clearInterval(interval);
  }, [shareholder]);

  const weeklyUsed = weeklyPoints?.used ?? false;

  if (loadingShareholder) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (shareholderError || !shareholder) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-white">加载失败</p>
          <p className="mt-2 text-sm text-white/60">{shareholderError || '无法获取股东信息'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-300"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Header shareholder={shareholder} onShowQR={() => setShowQRLocal(true)} />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="wallet"
          label="Snow Points"
          value={pointsBalance.toLocaleString()}
          sub={`${sharePercent}% ${tier}`}
          animate
          numericValue={pointsBalance}
        />
        <StatCard
          icon="shield"
          label="Shareholding"
          value={`${sharePercent}%`}
          sub={tier}
        />
      </div>

      {/* Weekly Points Card */}
      <div className="mt-3 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-300/20 to-amber-950/30 p-5 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-amber-200">每周股东权益</p>
            <p className="mt-1 text-xs text-white/60">{weekRange}</p>
          </div>
          <div className="rounded-2xl bg-amber-400/20 px-3 py-1">
            <span className="text-xs font-bold text-amber-300">WEEKLY</span>
          </div>
        </div>

        <div className="mt-4">
          {loadingWeeklyPoints ? (
            <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
          ) : weeklyUsed ? (
            <div className="flex items-center justify-between rounded-2xl bg-zinc-950/50 px-4 py-3">
              <span className="text-sm text-white/60">本周已抵扣</span>
              <span className="text-2xl font-black text-white/50">
                {weeklyPointsValue.toLocaleString()} 分
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-400/20 px-4 py-3">
              <span className="text-sm text-emerald-200">本周剩余可用</span>
              <span className="text-2xl font-black text-emerald-300">
                {weeklyPointsValue.toLocaleString()} 分
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2 rounded-2xl bg-zinc-950/50 p-4 text-xs text-white/60">
          <p>• 每周限用一次，用完即止</p>
          <p>• 不可累积，每周一重置</p>
          <p>• 仅限本人使用</p>
        </div>
      </div>

      <QRCodeDisplay isOpen={showQRLocal} onClose={() => setShowQRLocal(false)} />

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-bold text-white/80">快速操作</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowQRLocal(true)}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
          >
            <div className="rounded-xl bg-emerald-400/20 p-2">
              <Icon name="qr" className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="font-bold text-white">出示二维码</p>
              <p className="text-xs text-white/50">扫码核销</p>
            </div>
          </button>
          <button
            onClick={() => setActive('benefits')}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
          >
            <div className="rounded-xl bg-amber-300/20 p-2">
              <Icon name="gift" className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-white">股东权益</p>
              <p className="text-xs text-white/50">查看详情</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <ShareholderProvider>
      <AuthGuard>
        <div className="flex min-h-screen flex-col bg-zinc-950">
          <main className="flex-1">
            {activeTab === 'home' && (
              <HomeScreen setActive={setActiveTab} onShowQR={() => {}} />
            )}
          </main>

          <BottomNav active={activeTab} onChange={setActiveTab} />
          <NetworkStatus />
        </div>
      </AuthGuard>
    </ShareholderProvider>
  );
}
