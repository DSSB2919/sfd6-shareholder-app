// SFD6 Shareholder Types

export interface Shareholder {
  id: number;
  member_no: string;
  name: string;
  phone: string;
  email?: string;
  share_percent: number;
  actual_investment_rm: number;
  points_balance: number;
  tier: ShareholderTier;
  weekly_points: number;
  referral_code: string;
  family_cards?: FamilyCard[];
}

export type ShareholderTier = 
  | 'Support Shareholder'
  | 'Lifestyle Shareholder' 
  | 'Strategic Shareholder'
  | 'Core Shareholder'
  | 'Founding Partner';

export interface FamilyCard {
  id: number;
  shareholder_id: number;
  card_number: string;
  name: string;
  relationship: 'spouse' | 'child';
  qr_code: string;
  qr_expires_at?: string;
  is_active: boolean;
}

export interface Cashier {
  id: number;
  username: string;
  name: string;
  is_admin: boolean;
}

export interface Redemption {
  id: number;
  shareholder_id: number;
  family_card_id?: number;
  cashier_id: number;
  food_amount_rm: number;
  alcohol_amount_rm: number;
  points_deducted: number;
  final_pay_rm: number;
  created_at: string;
  shareholder?: Shareholder;
  family_card?: FamilyCard;
}

export interface PointsTransaction {
  id: number;
  shareholder_id: number;
  type: 'earn' | 'deduct' | 'weekly_grant' | 'adjustment';
  amount: number;
  description?: string;
  created_at: string;
}

export interface TierInfo {
  name: ShareholderTier;
  share: string;
  investment: string;
  points: string;
  weekly: string;
  tag: string;
  highlight: string;
  benefits: string[];
}

export interface QRCodeData {
  type: 'self' | 'family';
  shareholder_id: number;
  family_card_id?: number;
  food_amount?: number;
  alcohol_amount?: number;
  points_deduct?: number;
  timestamp: number;
  expires_at: number;
  signature: string;
}

export const TIERS: TierInfo[] = [

  {
    name: 'Lifestyle Shareholder',
    share: '3%',
    investment: 'RM28,800',
    points: '28,800',
    weekly: '50 / week',
    tag: '生活方式股东',
    highlight: '适合经常社交、聚餐、带朋友消费的股东',
    benefits: [
      '28,800 Snow Points 本金消费积分',
      '每周 50 分股东消费额度',
      '2 张家属副卡（本轮暂不开放）',
      '大节日优先订位',
      '每月 1 次 VIP 桌优先申请',
      '带客食物 6% 奖励 / 酒精 2.5% 奖励',
    ],
  },
  {
    name: 'Strategic Shareholder',
    share: '5%',
    investment: 'RM48,000',
    points: '48,000',
    weekly: '80 / week',
    tag: '战略股东',
    highlight: '适合有资源、人脉、企业聚餐与活动需求的投资人',
    benefits: [
      '48,000 Snow Points 本金消费积分',
      '每周 80 分股东消费额度',
      '2 张家属副卡',
      '大节日免 Deposit 订位',
      '酒精私人采购协助',
      '每年 1 次场地费 50% 优惠',
      '带客食物 8% 奖励 / 酒精 3% 奖励',
      '企业包场 / 活动介绍 5% 奖励',
    ],
  },
  {
    name: 'Core Shareholder',
    share: '10%',
    investment: 'RM96,000',
    points: '96,000',
    weekly: '150 / week',
    tag: '核心股东',
    highlight: '适合希望深度参与雪山飞狐发展、资源整合与社交圈层的核心投资人',
    benefits: [
      '96,000 Snow Points 本金消费积分',
      '每周 150 分股东消费额度',
      '2 张家属副卡',
      '大节日免 Deposit + VIP 桌优先权',
      '每年 1 次私人活动场地费豁免',
      '商务招待额度 RM500 / 月',
      '酒精私人采购协助',
      '股东铭牌 / Founding Circle 展示权',
      '带客食物 8% 奖励 / 酒精 3% 奖励',
      '企业包场 / 婚礼 / 生日宴介绍 5% 奖励',
    ],
  },
  {
    name: 'Founding Partner',
    share: '20%+',
    investment: 'RM192,000+',
    points: '192,000+',
    weekly: '300 / week',
    tag: '创始合伙股东',
    highlight: '适合希望深度绑定雪山飞狐品牌发展、资源整合、高端社交与商业招待需求的顶级投资人',
    benefits: [
      '192,000+ Snow Points 本金消费积分',
      '每周 300 分股东消费额度',
      '2 张家属副卡',
      '全年重大节日免 Deposit',
      '优先 VIP 桌 / 黄金席位保留权',
      '每年 2 次私人活动场地费豁免',
      '商务招待额度 RM1,000 / 月',
      '酒精私人采购协助 + 稀缺酒款优先预订',
      'Founding Partner Wall 名字 / 公司名展示权',
      '专属身份卡 / 股东编号 / VIP 管家式订位',
      '带客食物 10% 奖励 / 酒精 4% 奖励',
      '包场 / 婚礼 / 赞助 / 合作资源介绍享更高奖励',
    ],
  },
];

export const ACTIVITY_REWARDS = [
  { type: '带客食物 / 无酒精', reward: '5% - 10% 雪山分', note: '按股东等级：Support 5% → Founding 10%' },
  { type: '带客酒精饮料', reward: '2% - 4% 雪山分', note: '按股东等级：Support 2% → Founding 4%' },
  { type: '企业聚餐 / 包场', reward: '5% 佣金或雪山分', note: '成交后计算' },
  { type: '婚礼 / 生日宴', reward: '3% - 5%', note: '按活动规模审批' },
  { type: '赞助商 / 摊主介绍', reward: '10% 首笔奖励', note: '以公司确认金额为准' },
];

export const BENEFITS = [
  {
    icon: 'wallet',
    title: '投资额同等 Snow Points',
    desc: '1% = RM9,600 = 9,600 Snow Points；10% = RM96,000；20% = RM192,000。',
  },
  {
    icon: 'percent',
    title: '消费抵扣机制',
    desc: '每 RM100 可抵扣：Founding Partner 25分/10分，Core 20分/8分，Strategic 15分/5分。',
  },
  {
    icon: 'gift',
    title: '每周股东福利',
    desc: '不同等级每周自动获得 30 / 50 / 80 / 150 / 300 分消费额度，当周有效。',
  },
  {
    icon: 'wine',
    title: '酒精私人采购协助',
    desc: '符合规定下，通过雪山供应商渠道获得成本价 + handling fee 的私人采购服务。',
  },
  {
    icon: 'calendar',
    title: '节日免 Deposit / 优先订位',
    desc: '大型节日、倒数夜、主题活动优先开放订位，核心与创始合伙股东可免 Deposit。',
  },
  {
    icon: 'users',
    title: '带客奖励与资源变现',
    desc: '带客消费最高享 10% 食物奖励、4% 酒精奖励；介绍包场/活动享 5% 佣金。',
  },
];