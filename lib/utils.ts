// Utility functions

export function formatRM(value: number): string {
  return `RM${value.toLocaleString('en-MY', { maximumFractionDigits: 0 })}`;
}

// 根据股东等级获取每RM100可抵扣的积分
export function getDeductPointsByTier(tier: string): { food: number; alcohol: number } {
  switch (tier) {
    case 'Founding Partner':
      return { food: 25, alcohol: 10 }; // 每RM100抵扣25分/10分
    case 'Core Shareholder':
      return { food: 20, alcohol: 8 }; // 每RM100抵扣20分/8分
    case 'Strategic Shareholder':
      return { food: 15, alcohol: 5 }; // 每RM100抵扣15分/5分
    case 'Lifestyle Shareholder':
      return { food: 10, alcohol: 3 }; // 每RM100抵扣10分/3分
    default:
      return { food: 10, alcohol: 3 };
  }
}

// 计算食物抵扣积分（每RM100为单位）
export function calculateFoodDeduct(amount: number, tier?: string): number {
  const pointsPer100 = tier ? getDeductPointsByTier(tier).food : 30;
  const units = Math.floor(amount / 100); // 每100为单位
  return units * pointsPer100;
}

// 计算酒精抵扣积分（每RM100为单位）
export function calculateAlcoholDeduct(amount: number, tier?: string): number {
  const pointsPer100 = tier ? getDeductPointsByTier(tier).alcohol : 10;
  const units = Math.floor(amount / 100); // 每100为单位
  return units * pointsPer100;
}

export function calculateReferralReward(amount: number, rate: number): number {
  return Math.round(amount * rate);
}

export function getTierByShare(sharePercent: number): string {
  if (sharePercent >= 20) return 'Founding Partner';
  if (sharePercent >= 10) return 'Core Shareholder';
  if (sharePercent >= 5) return 'Strategic Shareholder';
  if (sharePercent >= 3) return 'Lifestyle Shareholder';
  return 'Support Shareholder';
}

export function getWeeklyPointsByTier(tier: string): number {
  switch (tier) {
    case 'Founding Partner': return 300;
    case 'Core Shareholder': return 150;
    case 'Strategic Shareholder': return 80;
    case 'Lifestyle Shareholder': return 50;
    default: return 30;
  }
}

export function generateMemberNo(sharePercent: number, index: number): string {
  const prefix = sharePercent >= 20 ? 'FP' : 
                 sharePercent >= 10 ? 'CR' :
                 sharePercent >= 5 ? 'ST' :
                 sharePercent >= 3 ? 'LS' : 'SU';
  return `SFD6-${prefix}-${String(index).padStart(3, '0')}`;
}

export function generateReferralCode(memberNo: string): string {
  return `${memberNo}-2026`;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateQRCode(): string {
  return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isQRCodeExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt) < new Date();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}