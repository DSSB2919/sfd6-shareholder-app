'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import type { Shareholder, FamilyCard } from '@/types';

// Mock data
const mockShareholders: Shareholder[] = [
  {
    id: 1,
    member_no: 'SFD6-FP-001',
    name: 'MR. LEE WEN CHUIN',
    phone: '+60123456789',
    share_percent: 20,
    actual_investment_rm: 192000,
    points_balance: 185000,
    tier: 'Founding Partner',
    weekly_points: 300,
    referral_code: 'SFD6-FP-2026',
  },
  {
    id: 2,
    member_no: 'SFD6-CR-002',
    name: 'MS. TAN MEI LING',
    phone: '+60129876543',
    share_percent: 10,
    actual_investment_rm: 96000,
    points_balance: 92000,
    tier: 'Core Shareholder',
    weekly_points: 150,
    referral_code: 'SFD6-CR-2026',
  },
];

const mockFamilyCards: Record<number, FamilyCard[]> = {
  1: [
    { id: 1, shareholder_id: 1, card_number: 'SFD6-FP-001-A', name: '李太太', relationship: 'spouse', qr_code: 'qr_001_a', is_active: true },
    { id: 2, shareholder_id: 1, card_number: 'SFD6-FP-001-B', name: '李小明', relationship: 'child', qr_code: 'qr_001_b', is_active: true },
  ],
  2: [
    { id: 3, shareholder_id: 2, card_number: 'SFD6-CR-002-A', name: '陈先生', relationship: 'spouse', qr_code: 'qr_002_a', is_active: true },
  ],
};

export default function AdminFamilyCards() {
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);
  const [familyCards, setFamilyCards] = useState<Record<number, FamilyCard[]>>(mockFamilyCards);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'spouse' as 'spouse' | 'child',
  });

  const filteredShareholders = mockShareholders.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.member_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCardCount = (shareholderId: number) => {
    return familyCards[shareholderId]?.length || 0;
  };

  const handleAddCard = () => {
    if (!selectedShareholder) return;
    
    const currentCards = familyCards[selectedShareholder.id] || [];
    if (currentCards.length >= 2) {
      alert('该股东已有2张副卡，无法继续添加');
      return;
    }

    const newCard: FamilyCard = {
      id: Date.now(),
      shareholder_id: selectedShareholder.id,
      card_number: `${selectedShareholder.member_no}-${String.fromCharCode(65 + currentCards.length)}`,
      name: formData.name,
      relationship: formData.relationship,
      qr_code: `qr_${selectedShareholder.id}_${Date.now()}`,
      is_active: true,
    };

    setFamilyCards({
      ...familyCards,
      [selectedShareholder.id]: [...currentCards, newCard],
    });

    setFormData({ name: '', relationship: 'spouse' });
    setShowAddModal(false);
  };

  const handleDeactivateCard = (shareholderId: number, cardId: number) => {
    const updatedCards = familyCards[shareholderId].map(card =>
      card.id === cardId ? { ...card, is_active: !card.is_active } : card
    );
    setFamilyCards({ ...familyCards, [shareholderId]: updatedCards });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Admin</p>
            <h1 className="mt-1 text-2xl font-black text-white">副卡管理</h1>
          </div>
          <button className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20">
            <Icon name="logout" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-28 pt-6">
        {!selectedShareholder ? (
          /* Shareholder Selection */
          <>
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索股东..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              {filteredShareholders.map((shareholder, index) => {
                const cardCount = getCardCount(shareholder.id);
                return (
                  <motion.div
                    key={shareholder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedShareholder(shareholder)}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white">{shareholder.name}</h3>
                        <p className="mt-1 text-xs text-white/50">{shareholder.member_no}</p>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          cardCount >= 2 
                            ? 'bg-emerald-400/20 text-emerald-300' 
                            : 'bg-amber-400/20 text-amber-300'
                        }`}>
                          {cardCount}/2 副卡
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                      <Icon name="ticket" className="h-4 w-4" />
                      <span>点击管理副卡</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          /* Family Cards Management */
          <>
            <button
              onClick={() => setSelectedShareholder(null)}
              className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white"
            >
              <Icon name="chevron" className="h-4 w-4 rotate-180" />
              返回股东列表
            </button>

            <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
              <h2 className="font-bold text-white">{selectedShareholder.name}</h2>
              <p className="mt-1 text-xs text-white/60">{selectedShareholder.member_no}</p>
              <p className="mt-1 text-xs text-emerald-300">{selectedShareholder.tier}</p>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-white">副卡列表</h3>
              {getCardCount(selectedShareholder.id) < 2 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-300"
                >
                  添加副卡
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(familyCards[selectedShareholder.id] || []).map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{card.name}</h4>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          card.relationship === 'spouse' 
                            ? 'bg-pink-400/20 text-pink-300' 
                            : 'bg-blue-400/20 text-blue-300'
                        }`}>
                          {card.relationship === 'spouse' ? '配偶' : '子女'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/50">{card.card_number}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      card.is_active 
                        ? 'bg-emerald-400/20 text-emerald-300' 
                        : 'bg-red-400/20 text-red-300'
                    }`}>
                      {card.is_active ? '有效' : '已停用'}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleDeactivateCard(selectedShareholder.id, card.id)}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                        card.is_active
                          ? 'border border-red-400/30 bg-red-400/10 text-red-300'
                          : 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                      }`}
                    >
                      {card.is_active ? '停用' : '启用'}
                    </button>
                  </div>
                </motion.div>
              ))}

              {getCardCount(selectedShareholder.id) === 0 && (
                <div className="py-12 text-center">
                  <Icon name="ticket" className="mx-auto mb-4 h-12 w-12 text-white/20" />
                  <p className="text-white/50">暂无副卡</p>
                  <p className="mt-1 text-xs text-white/30">点击右上角添加</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Card Modal */}
      {showAddModal && selectedShareholder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-6"
          >
            <h2 className="text-xl font-bold text-white">添加副卡</h2>
            <p className="mt-1 text-sm text-white/50">{selectedShareholder.name}</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/60">持卡人姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：李太太"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm text-white/60">关系</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, relationship: 'spouse' })}
                    className={`rounded-xl border py-3 text-center transition ${
                      formData.relationship === 'spouse'
                        ? 'border-pink-400 bg-pink-400/20 text-pink-300'
                        : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                  >
                    配偶
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, relationship: 'child' })}
                    className={`rounded-xl border py-3 text-center transition ${
                      formData.relationship === 'child'
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                  >
                    子女
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-amber-400/10 p-4">
                <p className="text-sm text-amber-200">
                  <span className="font-bold">提示：</span>
                  副卡添加后将自动生成二维码，股东可在App中查看。
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl border border-white/20 bg-transparent py-3 font-bold text-white hover:bg-white/5"
              >
                取消
              </button>
              <button
                onClick={handleAddCard}
                disabled={!formData.name}
                className="flex-1 rounded-xl bg-emerald-400 py-3 font-bold text-zinc-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}