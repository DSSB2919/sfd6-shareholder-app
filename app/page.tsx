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
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
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
  const [weeklyPoints, setWeeklyPoints] = useState<WeeklyPointsStatus | null>(null);
  const [loadingWeeklyPoints, setLoadingWeeklyPoints] = useState(true);

  // 获取本周积分使用状态
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
    // 每 30 秒刷新一次状态
    const interval = setInterval(fetchWeeklyPoints, 30000);
    return () => clearInterval(interval);
  }, [shareholder]);

  const weeklyUsed = weeklyPoints?.used ?? false;

  // 加载中状态
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

  // 错误状态
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
    <div className="space-y-5 pb-28">
      <Header shareholder={shareholder} onShowQR={onShowQR} />

      <div className="px-5">
        {/* Stats Grid - 简化为3个 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="wallet"
            label="Snow Points"
            value={(shareholder.points_balance ?? 0).toLocaleString()}
            sub={`${shareholder.share_percent}% ${shareholder.tier}`}
            animate
            numericValue={shareholder.points_balance}
          />
          <StatCard
            icon="shield"
            label="Shareholding"
            value={`${shareholder.share_percent}%`}
            sub={shareholder.tier}
          />
        </div>

        {/* Weekly Points 详细卡片 */}
        <div className="mt-3 rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-300/20 to-amber-950/30 p-5 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Icon name="gift" className="h-5 w-5 text-amber-300" />
                <span className="text-sm text-amber-300">股东每周赠送福利</span>
              </div>
              <p className="mt-1 text-sm text-white/60">{weekRange}</p>
            </div>
            <div className="rounded-full bg-amber-400/20 px-3 py-1">
              {loadingWeeklyPoints ? (
                <span className="text-xs font-bold text-white/50">加载中...</span>
              ) : (
                <span className={`text-xs font-bold ${weeklyUsed ? 'text-white/50' : 'text-emerald-300'}`}>
                  {weeklyUsed ? '本周已用完' : '本周可用'}
                </span>
              )}
            </div>
          </div>

          {/* 显示剩余/已用额度 */}
          <div className="mt-4">
            {loadingWeeklyPoints ? (
              <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
            ) : weeklyUsed ? (
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/50 px-4 py-3">
                <span className="text-sm text-white/60">本周已抵扣</span>
                <span className="text-2xl font-black text-white/50">
                  {(shareholder.weekly_points ?? 0).toLocaleString()} 分
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl bg-emerald-400/20 px-4 py-3">
                <span className="text-sm text-emerald-200">本周剩余可用</span>
                <span className="text-2xl font-black text-emerald-300">
                  {(shareholder.weekly_points ?? 0).toLocaleString()} 分
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 rounded-2xl bg-zinc-950/50 p-4 text-xs text-white/60">
            <p>• 每周限用一次，用完即止</p>
            <p>• 消费超过额度需补差价，消费少于额度不退款</p>
            <p>• 每周一自动重置额度</p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="mt-3 rounded-3xl border border-white/10 bg-zinc-900 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">推荐码</p>
              <p className="font-mono text-lg font-bold text-emerald-300">{shareholder.referral_code}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <Icon name="share" className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="mt-2 text-xs text-white/40">分享给朋友注册时使用</p>
        </div>

      </div>
    </div>
  );
}

function PointsScreen() {
  const { shareholder, loading, error } = useShareholder();
  // 从 localStorage 读取保存的计算值
  const [foodAmount, setFoodAmount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('points_calculator_food');
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  });
  const [alcoholAmount, setAlcoholAmount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('points_calculator_alcohol');
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  });

  // 保存计算值到 localStorage
  useEffect(() => {
    localStorage.setItem('points_calculator_food', foodAmount.toString());
  }, [foodAmount]);

  useEffect(() => {
    localStorage.setItem('points_calculator_alcohol', alcoholAmount.toString());
  }, [alcoholAmount]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-white">加载失败</p>
          <p className="mt-2 text-sm text-white/60">{error || '无法获取股东信息'}</p>
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

  // 根据股东等级获取抵扣规则
  const deductPoints = getDeductPointsByTier(shareholder.tier);
  const foodPointsPer100 = deductPoints.food;
  const alcoholPointsPer100 = deductPoints.alcohol;

  const foodDeduct = calculateFoodDeduct(foodAmount, shareholder.tier);
  const alcoholDeduct = calculateAlcoholDeduct(alcoholAmount, shareholder.tier);
  const totalBill = foodAmount + alcoholAmount;
  const totalDeduct = foodDeduct + alcoholDeduct;
  const finalPay = totalBill - totalDeduct;

  return (
    <div className="space-y-5 px-5 pb-28 pt-8 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Snow Points</p>
        <h2 className="mt-1 text-3xl font-black">积分抵扣计算器</h2>
        <p className="mt-2 text-sm text-white/50">每RM100可抵扣：食物 {foodPointsPer100}分 / 酒精 {alcoholPointsPer100}分</p>
      </div>

      {/* 股东等级和实时积分余额 */}
      <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">{shareholder.share_percent}% {shareholder.tier}</p>
            <p className="text-xs text-white/40 mt-1">实时积分余额</p>
          </div>
          <p className="text-2xl font-black text-emerald-300">{(shareholder.points_balance ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Food Input */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">食物 / 无酒精饮料消费</h3>
            <p className="mt-1 text-xs text-white/50">每RM100抵扣 {foodPointsPer100} 分</p>
          </div>
          <p className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300">
            可抵 {foodDeduct} 分
          </p>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFoodAmount(Math.max(0, foodAmount - 50))}
            className="rounded-2xl bg-white/10 p-3 hover:bg-white/20"
          >
            <Icon name="minus" className="h-4 w-4" />
          </button>
          <div className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-xl font-black text-zinc-950">
            {formatRM(foodAmount)}
          </div>
          <button
            type="button"
            onClick={() => setFoodAmount(foodAmount + 50)}
            className="rounded-2xl bg-white/10 p-3 hover:bg-white/20"
          >
            <Icon name="plus" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alcohol Input */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">酒精饮料消费</h3>
            <p className="mt-1 text-xs text-white/50">每RM100抵扣 {alcoholPointsPer100} 分</p>
          </div>
          <p className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300">
            可抵 {alcoholDeduct} 分
          </p>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAlcoholAmount(Math.max(0, alcoholAmount - 50))}
            className="rounded-2xl bg-white/10 p-3 hover:bg-white/20"
          >
            <Icon name="minus" className="h-4 w-4" />
          </button>
          <div className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-xl font-black text-zinc-950">
            {formatRM(alcoholAmount)}
          </div>
          <button
            type="button"
            onClick={() => setAlcoholAmount(alcoholAmount + 50)}
            className="rounded-2xl bg-white/10 p-3 hover:bg-white/20"
          >
            <Icon name="plus" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-3xl border-none bg-white p-5 text-zinc-950 shadow-xl">
        <h3 className="text-lg font-black">本单结算预览</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-zinc-500">原账单金额</span>
            <span className="font-bold">{formatRM(totalBill)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-zinc-500">可抵扣雪山分</span>
            <span className="font-bold">{totalDeduct} 分</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">抵扣后应付</span>
            <span className="text-xl font-black">{formatRM(finalPay)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitsScreen() {
  const { shareholder, loading, error } = useShareholder();
  
  // 过滤掉1%（不开放），3%标记为sleeping
  const availableTiers = TIERS.filter(t => t.share !== '1%');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-white">加载失败</p>
          <p className="mt-2 text-sm text-white/60">{error || '无法获取股东信息'}</p>
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

  // 获取当前股东的等级名称
  const currentTierName = shareholder.tier;

  return (
    <div className="space-y-5 px-5 pb-28 pt-8 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Privilege</p>
        <h2 className="mt-1 text-3xl font-black">新投资人股东权益</h2>
        <p className="mt-2 text-sm text-white/50">本轮融资开放 5% / 10% / 20%+ 等级</p>
      </div>

      {/* 当前股东身份卡片 */}
      <div className="rounded-3xl border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-400/20 to-emerald-950/30 p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-400/20 p-3">
            <Icon name="crown" className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-xs text-emerald-300">您的股东身份</p>
            <h3 className="text-xl font-black text-white">{shareholder.tier}</h3>
            <p className="text-sm text-white/60">{shareholder.share_percent}% · {(shareholder.points_balance || 0).toLocaleString()} Snow Points</p>
          </div>
        </div>
      </div>

      {/* 本轮融资说明 */}
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 shadow-xl">
        <div className="flex items-center gap-2">
          <Icon name="info" className="h-5 w-5 text-emerald-300" />
          <span className="font-bold text-emerald-300">本轮融资说明</span>
        </div>
        <p className="mt-2 text-sm text-white/70">
          1% 与 3% 等级本轮暂不开放。现有 4 位 3% Sleeping 股东保留权益。
        </p>
      </div>

      <div className="space-y-4">
        {availableTiers.map((tier, index) => {
          const isTopTier = index === availableTiers.length - 1;
          const isSleeping = tier.share === '3%';
          // 判断是否是当前股东的等级
          const isCurrentTier = tier.name === currentTierName;
          
          return (
            <div
              key={tier.name}
              className={`rounded-3xl border p-5 shadow-xl ${
                isCurrentTier
                  ? 'border-2 border-emerald-400 bg-gradient-to-br from-emerald-400/30 to-emerald-950/50 text-white'
                  : isTopTier
                    ? 'border-amber-300/30 bg-gradient-to-br from-amber-200 via-white to-emerald-100 text-zinc-950'
                    : isSleeping
                      ? 'border-white/5 bg-white/5 text-white/50'
                      : 'border-white/10 bg-white/10 text-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${
                      isCurrentTier ? 'text-emerald-300' : isTopTier ? 'text-zinc-600' : isSleeping ? 'text-white/30' : 'text-white/50'
                    }`}>
                      {tier.tag}
                    </p>
                    {isCurrentTier && (
                      <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-bold text-zinc-950">
                        当前身份
                      </span>
                    )}
                    {isSleeping && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">
                        Sleeping
                      </span>
                    )}
                  </div>
                  <h3 className={`mt-1 text-xl font-black ${isCurrentTier ? 'text-white' : isSleeping ? 'text-white/60' : ''}`}>{tier.name}</h3>
                  <p className={`mt-1 text-sm ${
                    isCurrentTier ? 'text-emerald-200' : isTopTier ? 'text-zinc-600' : isSleeping ? 'text-white/30' : 'text-white/50'
                  }`}>
                    {tier.share} · {tier.investment} · {tier.points} points
                  </p>
                </div>
                <Icon name="crown" className={`h-7 w-7 ${
                  isCurrentTier ? 'text-emerald-300' : isTopTier ? 'text-zinc-950' : isSleeping ? 'text-white/30' : 'text-amber-300'
                }`} />
              </div>
              <p className={`mt-3 rounded-2xl px-3 py-2 text-sm ${
                isCurrentTier
                  ? 'bg-emerald-400/20 text-emerald-100'
                  : isTopTier
                    ? 'bg-zinc-950/10 text-zinc-700'
                    : isSleeping
                      ? 'bg-white/5 text-white/40'
                      : 'bg-white/10 text-white/65'
              }`}>
                {isCurrentTier ? '✓ 这是您当前的股东等级权益' : isSleeping ? '本轮暂不开放，仅保留现有 Sleeping 股东权益' : tier.highlight}
              </p>
              <div className="mt-4 grid gap-2">
                {tier.benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${
                      isCurrentTier
                        ? 'bg-emerald-400/10 text-white'
                        : isTopTier
                          ? 'bg-zinc-950/10'
                          : isSleeping
                            ? 'bg-white/5 text-white/40'
                            : 'bg-white/10'
                    }`}
                  >
                    <Icon name="shield" className={`h-4 w-4 shrink-0 ${isCurrentTier ? 'text-emerald-300' : isSleeping ? 'text-white/30' : ''}`} />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-white shadow-xl">
        <h3 className="text-lg font-black">重要说明</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          Snow Points 仅为股东消费权益积分，不属于现金、不予提现、不予退款、不可转让，也不构成任何固定回报或保本承诺。最终权益以公司正式股东福利条款为准。
        </p>
      </div>

      {/* Benefits List */}
      <div className="grid gap-3">
        {BENEFITS.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white p-3 text-zinc-950">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/55">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralScreen({ onShowReferralQR }: { onShowReferralQR: () => void }) {
  const { shareholder, loading, error } = useShareholder();
  const [guestSpend, setGuestSpend] = useState(1000);

  // 根据股东等级获取带客奖励比例
  const getReferralRates = (tier: string) => {
    switch (tier) {
      case 'Founding Partner':
        return { food: 0.10, alcohol: 0.04, label: '10% / 4%' };
      case 'Core Shareholder':
        return { food: 0.08, alcohol: 0.03, label: '8% / 3%' };
      case 'Strategic Shareholder':
        return { food: 0.08, alcohol: 0.03, label: '8% / 3%' };
      case 'Lifestyle Shareholder':
        return { food: 0.06, alcohol: 0.025, label: '6% / 2.5%' };
      default: // Support Shareholder
        return { food: 0.05, alcohol: 0.02, label: '5% / 2%' };
    }
  };

  const rates = shareholder ? getReferralRates(shareholder.tier) : { food: 0.10, alcohol: 0.04, label: '10% / 4%' };
  const foodReward = calculateReferralReward(guestSpend, rates.food);
  const alcoholReward = calculateReferralReward(guestSpend, rates.alcohol);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-white">加载失败</p>
          <p className="mt-2 text-sm text-white/60">{error || '无法获取股东信息'}</p>
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
    <div className="space-y-5 px-5 pb-28 pt-8 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Referral Rewards</p>
        <h2 className="mt-1 text-3xl font-black">股东带客奖励</h2>
        <p className="mt-2 text-sm text-white/50">把人脉变成消费，把消费变成股东奖励。</p>
      </div>

      {/* 带客消费码卡片 */}
      <div
        onClick={onShowReferralQR}
        className="cursor-pointer rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-emerald-950/50 p-5 text-white shadow-xl transition hover:from-emerald-400/30 hover:to-emerald-950/60"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-400/20 p-3">
              <Icon name="users" className="h-7 w-7 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">生成带客消费码</h3>
              <p className="text-xs text-white/60">给客人扫码，计入带客奖励</p>
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-bold text-emerald-300">5分钟</span>
            <div className="mt-2 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-zinc-950">
              点击生成
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="rounded-3xl border-none bg-white p-5 text-zinc-950 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">我的推荐码</p>
            <p className="mt-1 font-mono text-xl font-black">{shareholder.referral_code}</p>
          </div>
          <Icon name="share" className="h-12 w-12 text-zinc-400" />
        </div>
        <p className="mt-3 text-xs text-zinc-400">分享给朋友注册时使用</p>
      </div>

      {/* Calculator */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 text-white shadow-xl">
        <h3 className="text-lg font-black">{shareholder.tier} 带客收益试算</h3>
        <p className="mt-1 text-sm text-white/50">您的带客奖励比例：食物 {rates.label}</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuestSpend(Math.max(0, guestSpend - 500))}
            className="rounded-2xl bg-white/10 p-3 hover:bg-white/20"
          >
            <Icon name="minus" className="h-4 w-4" />
          </button>
          <div className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-xl font-black text-zinc-950">
            {formatRM(guestSpend)}
          </div>
          <button
            type="button"
            onClick={() => setGuestSpend(guestSpend + 500)}
            className="rounded-2xl bg-white/10 p-3 hover:bg-white/20"
          >
            <Icon name="plus" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-white/50">食物奖励 {(rates.food * 100).toFixed(rates.food % 1 === 0 ? 0 : 1)}%</p>
            <p className="mt-1 text-2xl font-black text-emerald-300">{foodReward} 分</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-white/50">酒精奖励 {(rates.alcohol * 100).toFixed(rates.alcohol % 1 === 0 ? 0 : 1)}%</p>
            <p className="mt-1 text-2xl font-black text-amber-300">{alcoholReward} 分</p>
          </div>
        </div>
      </div>

      {/* Activity Rewards */}
      <div className="space-y-3">
        {ACTIVITY_REWARDS.map((item) => (
          <div key={item.type} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold">{item.type}</h3>
                <p className="mt-1 text-xs text-white/50">{item.note}</p>
              </div>
              <p className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-zinc-950">{item.reward}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen() {
  const { shareholder, loading: shareholderLoading, error } = useShareholder();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    setErrorMsg(null);

    try {
      const response = await fetch('/api/shareholder/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareholder_id: shareholder?.id,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || '密码修改失败');
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (shareholderLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-white">加载失败</p>
          <p className="mt-2 text-sm text-white/60">{error || '无法获取股东信息'}</p>
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

  const { logout } = useShareholder();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  return (
    <div className="space-y-5 px-5 pb-28 pt-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Settings</p>
        <h2 className="mt-1 text-3xl font-black">设置</h2>
      </div>

      {/* Security Section */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
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

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-red-400/20 p-3 text-center"
          >
            <p className="text-sm font-bold text-red-300">✗ {errorMsg}</p>
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
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少6位字符"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
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

      {/* Account Section */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
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

      {/* About Section */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
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
  );
}

function FamilyQRScreen() {
  const { shareholder, loading, error } = useShareholder();
  const [showFamilyQR, setShowFamilyQR] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <Icon name="info" className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-white">加载失败</p>
          <p className="mt-2 text-sm text-white/60">{error || '无法获取股东信息'}</p>
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
    <div className="space-y-5 px-5 pb-28 pt-8 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Family QR</p>
        <h2 className="mt-1 text-3xl font-black">家属消费码</h2>
        <p className="mt-2 text-sm text-white/50">生成二维码截图发给家属，扫码消费积分从主卡扣除。</p>
      </div>

      {/* Generate Family QR Card */}
      <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-emerald-950/50 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-400/20 p-4">
            <Icon name="users" className="h-8 w-8 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">家属消费二维码</h3>
            <p className="text-sm text-white/60">有效期 6 小时</p>
          </div>
        </div>
        
        <div className="mt-5 rounded-2xl bg-zinc-950/50 p-4">
          <ul className="space-y-2 text-sm text-white/70">
            <li>• 截图发给家属</li>
            <li>• Cashier 扫码核销</li>
            <li>• 消费积分从主卡扣除</li>
            <li>• 不占用 Weekly Points 额度</li>
          </ul>
        </div>

        <button 
          onClick={() => setShowFamilyQR(true)}
          className="mt-5 w-full rounded-2xl bg-emerald-400 py-4 text-sm font-bold text-zinc-950 hover:bg-emerald-300"
        >
          生成家属消费码
        </button>
      </div>

      {/* Family QR Display */}
      {showFamilyQR && (
        <QRCodeDisplay
          shareholderId={shareholder.id}
          shareholderName={shareholder.name}
          memberNo={shareholder.member_no}
          type="family"
          onClose={() => setShowFamilyQR(false)}
        />
      )}

      {/* Usage Tips */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 text-white">
        <h3 className="font-bold">使用提示</h3>
        <ul className="mt-3 space-y-2 text-sm text-white/60">
          <li>• 家属消费不享受 Weekly Points 抵扣</li>
          <li>• 积分直接从主卡 Snow Points 扣除</li>
          <li>• 截图后请尽快使用，6 小时后失效</li>
          <li>• 可多次生成，每次生成新的独立二维码</li>
        </ul>
      </div>
    </div>
  );
}

// 内部 App 组件，使用 shareholder context
function AppContent() {
  const [active, setActive] = useState('home');
  const [showQR, setShowQR] = useState(false);
  const [showReferralQR, setShowReferralQR] = useState(false);
  const { shareholder, loading } = useShareholder();

  return (
    <>
      <NetworkStatus />
      {active === 'home' && (
        <HomeScreen
          setActive={setActive}
          onShowQR={() => setShowQR(true)}
        />
      )}
      {active === 'points' && <PointsScreen />}
      {active === 'benefits' && <BenefitsScreen />}
      {active === 'referral' && <ReferralScreen onShowReferralQR={() => setShowReferralQR(true)} />}
      {active === 'family' && <FamilyQRScreen />}
      {active === 'settings' && <SettingsScreen />}
      <BottomNav active={active} setActive={setActive} />

      {/* 股东自用码 */}
      {showQR && shareholder && (
        <QRCodeDisplay
          shareholderId={shareholder.id}
          shareholderName={shareholder.name}
          memberNo={shareholder.member_no}
          type="self"
          onClose={() => setShowQR(false)}
        />
      )}

      {/* 带客消费码 */}
      {showReferralQR && shareholder && (
        <QRCodeDisplay
          shareholderId={shareholder.id}
          shareholderName={shareholder.name}
          memberNo={shareholder.member_no}
          type="referral"
          onClose={() => setShowReferralQR(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-zinc-950 font-sans">
      <div className="mx-auto min-h-screen max-w-md overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_35%),linear-gradient(180deg,#09090b_0%,#18181b_100%)] shadow-2xl">
        <ShareholderProvider>
          <AuthGuard>
            <AppContent />
          </AuthGuard>
        </ShareholderProvider>
      </div>
    </main>
  );
}