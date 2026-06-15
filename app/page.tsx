'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { BENEFITS, TIERS, ACTIVITY_REWARDS } from '@/types';
import { formatRM, calculateFoodDeduct, calculateAlcoholDeduct, calculateReferralReward } from '@/lib/utils';

// Mock shareholder data - replace with API call
const shareholder = {
  id: 1,
  member_no: 'SFD6-FP-001',
  name: 'MR. LEE WEN CHUIN',
  phone: '+60123456789',
  share_percent: 20,
  actual_investment_rm: 192000,
  points_balance: 192000,
  tier: 'Founding Partner' as const,
  weekly_points: 300,
  referral_code: 'SFD6-FP-2026',
};

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
  const weeklyUsed = false; // TODO: 从API获取实际使用状态

  return (
    <div className="space-y-5 pb-28">
      <Header shareholder={shareholder} onShowQR={onShowQR} />

      <div className="px-5">
        {/* Stats Grid - 简化为3个 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="wallet"
            label="Snow Points"
            value={shareholder.points_balance.toLocaleString()}
            sub={`${shareholder.share_percent}% ${shareholder.tier}`}
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
                <span className="text-sm text-amber-300">Weekly Points</span>
              </div>
              <h3 className="mt-2 text-3xl font-black">{shareholder.weekly_points.toLocaleString()}</h3>
              <p className="mt-1 text-sm text-white/60">{weekRange}</p>
            </div>
            <div className="rounded-full bg-amber-400/20 px-3 py-1">
              <span className={`text-xs font-bold ${weeklyUsed ? 'text-white/50' : 'text-amber-300'}`}>
                {weeklyUsed ? '已使用' : '未使用'}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2 rounded-2xl bg-zinc-950/50 p-4 text-xs text-white/60">
            <p>• 每周限用一次</p>
            <p>• 消费超过补差价，消费少于不退款</p>
            <p>• 每周一自动重置</p>
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
  const [foodAmount, setFoodAmount] = useState(100);
  const [alcoholAmount, setAlcoholAmount] = useState(100);

  const foodDeduct = calculateFoodDeduct(foodAmount);
  const alcoholDeduct = calculateAlcoholDeduct(alcoholAmount);
  const totalBill = foodAmount + alcoholAmount;
  const totalDeduct = foodDeduct + alcoholDeduct;
  const finalPay = totalBill - totalDeduct;

  return (
    <div className="space-y-5 px-5 pb-28 pt-8 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Snow Points</p>
        <h2 className="mt-1 text-3xl font-black">积分抵扣计算器</h2>
        <p className="mt-2 text-sm text-white/50">食物 / 无酒精饮料最高 30%，酒精饮料最高 10%。</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-xl backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">20% 股东初始积分</p>
          <p className="text-2xl font-black text-emerald-300">192,000</p>
        </div>
        <p className="mt-2 text-xs text-white/40">1% = RM9,600 = 9,600 Snow Points</p>
      </div>

      {/* Food Input */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">食物 / 无酒精饮料消费</h3>
            <p className="mt-1 text-xs text-white/50">抵扣比例：30%</p>
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
            <p className="mt-1 text-xs text-white/50">抵扣比例：10%</p>
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
        <button className="mt-5 w-full rounded-2xl bg-zinc-950 py-4 text-sm font-semibold text-white hover:bg-zinc-800">
          生成抵扣二维码
        </button>
      </div>
    </div>
  );
}

function BenefitsScreen() {
  // 过滤掉1%（不开放），3%标记为sleeping
  const availableTiers = TIERS.filter(t => t.share !== '1%');

  return (
    <div className="space-y-5 px-5 pb-28 pt-8 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Privilege</p>
        <h2 className="mt-1 text-3xl font-black">新投资人股东权益</h2>
        <p className="mt-2 text-sm text-white/50">本轮融资开放 5% / 10% / 20%+ 等级</p>
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
          return (
            <div
              key={tier.name}
              className={`rounded-3xl border p-5 shadow-xl ${
                isTopTier
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
                      isTopTier ? 'text-zinc-600' : isSleeping ? 'text-white/30' : 'text-white/50'
                    }`}>
                      {tier.tag}
                    </p>
                    {isSleeping && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">
                        Sleeping
                      </span>
                    )}
                  </div>
                  <h3 className={`mt-1 text-xl font-black ${isSleeping ? 'text-white/60' : ''}`}>{tier.name}</h3>
                  <p className={`mt-1 text-sm ${
                    isTopTier ? 'text-zinc-600' : isSleeping ? 'text-white/30' : 'text-white/50'
                  }`}>
                    {tier.share} · {tier.investment} · {tier.points} points
                  </p>
                </div>
                <Icon name="crown" className={`h-7 w-7 ${
                  isTopTier ? 'text-zinc-950' : isSleeping ? 'text-white/30' : 'text-amber-300'
                }`} />
              </div>
              <p className={`mt-3 rounded-2xl px-3 py-2 text-sm ${
                isTopTier
                  ? 'bg-zinc-950/10 text-zinc-700'
                  : isSleeping
                    ? 'bg-white/5 text-white/40'
                    : 'bg-white/10 text-white/65'
              }`}>
                {isSleeping ? '本轮暂不开放，仅保留现有 Sleeping 股东权益' : tier.highlight}
              </p>
              {!isSleeping && (
                <div className="mt-4 grid gap-2">
                  {tier.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${
                        isTopTier ? 'bg-zinc-950/10' : 'bg-white/10'
                      }`}
                    >
                      <Icon name="shield" className="h-4 w-4 shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              )}
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
  const [guestSpend, setGuestSpend] = useState(1000);
  const foodReward = calculateReferralReward(guestSpend, 0.1);
  const alcoholReward = calculateReferralReward(guestSpend, 0.04);

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
        <h3 className="text-lg font-black">Founding Partner 带客收益试算</h3>
        <p className="mt-1 text-sm text-white/50">假设朋友消费金额：</p>
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
            <p className="text-xs text-white/50">食物奖励 10%</p>
            <p className="mt-1 text-2xl font-black text-emerald-300">{foodReward} 分</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-white/50">酒精奖励 4%</p>
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

function FamilyCardsScreen() {
  const [showFamilyQR, setShowFamilyQR] = useState<{ show: boolean; index: number } | null>(null);

  const familyCards = [
    { id: 1, name: '李太太', relationship: 'spouse' as const },
    { id: 2, name: '李小明', relationship: 'child' as const },
  ];

  return (
    <div className="space-y-5 px-5 pb-28 pt-8 text-white">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Family Cards</p>
        <h2 className="mt-1 text-3xl font-black">家属副卡管理</h2>
        <p className="mt-2 text-sm text-white/50">为配偶和子女生成消费二维码，积分从主卡扣除。</p>
      </div>

      {/* Family Cards List */}
      <div className="space-y-4">
        {familyCards.map((card, index) => (
          <div key={card.id} className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-bold text-emerald-300">
                    {card.relationship === 'spouse' ? '配偶' : '子女'}
                  </span>
                  <span className="text-xs text-white/50">{shareholder.member_no}-{String.fromCharCode(65 + index)}</span>
                </div>
                <h3 className="mt-2 text-xl font-bold">{card.name}</h3>
                <p className="mt-1 text-sm text-white/50">关联主股东：{shareholder.name}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <Icon name="ticket" className="h-6 w-6 text-amber-300" />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-zinc-950/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/50">二维码有效期</p>
                  <p className="text-sm font-semibold text-emerald-300">6 小时</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">状态</p>
                  <p className="text-sm font-semibold text-emerald-300">有效</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowFamilyQR({ show: true, index })}
              className="mt-4 w-full rounded-2xl bg-emerald-400 py-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              生成/刷新二维码
            </button>
          </div>
        ))}
      </div>

      {showFamilyQR?.show && (
        <QRCodeDisplay
          shareholderId={shareholder.id}
          shareholderName={shareholder.name}
          memberNo={shareholder.member_no}
          type="family"
          familyCard={familyCards[showFamilyQR.index]}
          onClose={() => setShowFamilyQR(null)}
        />
      )}

      {/* Info Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5 text-white">
        <h3 className="font-bold">副卡使用说明</h3>
        <ul className="mt-3 space-y-2 text-sm text-white/60">
          <li>• 每张副卡需要主股东实时生成二维码</li>
          <li>• 二维码有效期为 6 小时</li>
          <li>• 副卡消费积分从主卡余额扣除</li>
          <li>• 每位股东最多 2 张副卡</li>
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('home');
  const [showQR, setShowQR] = useState(false);
  const [showReferralQR, setShowReferralQR] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-950 font-sans">
      <div className="mx-auto min-h-screen max-w-md overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_35%),linear-gradient(180deg,#09090b_0%,#18181b_100%)] shadow-2xl">
        {active === 'home' && (
          <HomeScreen
            setActive={setActive}
            onShowQR={() => setShowQR(true)}
          />
        )}
        {active === 'points' && <PointsScreen />}
        {active === 'benefits' && <BenefitsScreen />}
        {active === 'referral' && <ReferralScreen onShowReferralQR={() => setShowReferralQR(true)} />}
        {active === 'family' && <FamilyCardsScreen />}
        <BottomNav active={active} setActive={setActive} />

        {/* 股东自用码 */}
        {showQR && (
          <QRCodeDisplay
            shareholderId={shareholder.id}
            shareholderName={shareholder.name}
            memberNo={shareholder.member_no}
            type="self"
            onClose={() => setShowQR(false)}
          />
        )}

        {/* 带客消费码 */}
        {showReferralQR && (
          <QRCodeDisplay
            shareholderId={shareholder.id}
            shareholderName={shareholder.name}
            memberNo={shareholder.member_no}
            type="referral"
            onClose={() => setShowReferralQR(false)}
          />
        )}
      </div>
    </main>
  );
}