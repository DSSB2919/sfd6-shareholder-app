// QR Code generation and validation utilities
// Uses simple HMAC-like signature for token validation

const SECRET_KEY = 'sfd6-qr-secret-2026'; // In production, use env variable

export interface QRToken {
  shareholderId: number;
  shareholderName: string;
  memberNo: string;
  type: 'self' | 'family';
  familyCardId?: number;
  familyName?: string;
  relationship?: string;
  timestamp: number;
  expiryMinutes: number;
  signature: string;
}

// Simple hash function (in production, use crypto library)
function generateSignature(data: Omit<QRToken, 'signature'>): string {
  const payload = `${data.shareholderId}:${data.memberNo}:${data.type}:${data.timestamp}:${data.expiryMinutes}:${SECRET_KEY}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Generate QR token
export function generateQRToken(
  shareholderId: number,
  shareholderName: string,
  memberNo: string,
  type: 'self' | 'family' = 'self',
  familyCard?: { id: number; name: string; relationship: string }
): QRToken {
  const timestamp = Date.now();
  const expiryMinutes = type === 'self' ? 5 : 360; // 5 min for self, 6 hours for family

  const tokenData: Omit<QRToken, 'signature'> = {
    shareholderId,
    shareholderName,
    memberNo,
    type,
    familyCardId: familyCard?.id,
    familyName: familyCard?.name,
    relationship: familyCard?.relationship,
    timestamp,
    expiryMinutes,
  };

  return {
    ...tokenData,
    signature: generateSignature(tokenData),
  };
}

// Validate QR token
export function validateQRToken(token: QRToken): { valid: boolean; error?: string } {
  // Check signature
  const expectedSignature = generateSignature({
    shareholderId: token.shareholderId,
    shareholderName: token.shareholderName,
    memberNo: token.memberNo,
    type: token.type,
    familyCardId: token.familyCardId,
    familyName: token.familyName,
    relationship: token.relationship,
    timestamp: token.timestamp,
    expiryMinutes: token.expiryMinutes,
  });

  if (token.signature !== expectedSignature) {
    return { valid: false, error: 'Invalid signature' };
  }

  // Check expiry
  const now = Date.now();
  const expiryTime = token.timestamp + token.expiryMinutes * 60 * 1000;
  
  if (now > expiryTime) {
    return { valid: false, error: 'QR code expired' };
  }

  return { valid: true };
}

// Format token for QR code (JSON string)
export function encodeQRToken(token: QRToken): string {
  return JSON.stringify(token);
}

// Parse token from QR code
export function decodeQRToken(qrData: string): QRToken | null {
  try {
    return JSON.parse(qrData) as QRToken;
  } catch {
    return null;
  }
}

// Get remaining time in minutes
export function getRemainingMinutes(token: QRToken): number {
  const now = Date.now();
  const expiryTime = token.timestamp + token.expiryMinutes * 60 * 1000;
  const remaining = Math.ceil((expiryTime - now) / (60 * 1000));
  return Math.max(0, remaining);
}

// Format remaining time for display
export function formatRemainingTime(minutes: number): string {
  if (minutes < 1) return '即将过期';
  if (minutes < 60) return `${minutes} 分钟后过期`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} 小时 ${mins > 0 ? mins + ' 分钟' : ''}后过期`;
}
