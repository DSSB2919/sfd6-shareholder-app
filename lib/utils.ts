// Utility functions

export function formatRM(value: number): string {
  return `RM${value.toLocaleString('en-MY', { maximumFractionDigits: 0 })}`;
}

export function calculateFoodDeduct(amount: number): number {
  return Math.floor(amount * 0.3);
}

export function calculateAlcoholDeduct(amount: number): number {
  return Math.floor(amount * 0.1);
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