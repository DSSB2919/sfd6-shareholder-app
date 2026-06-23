// Generate a test QR code token
const SECRET_KEY = 'sfd6-qr-secret-2026-fallback';

function generateSignature(data) {
  const payload = `${data.shareholderId}:${data.memberNo}:${data.type}:${data.timestamp}:${data.expiryMinutes}:${SECRET_KEY}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

const timestamp = Date.now();
const token = {
  shareholderId: 1,
  shareholderName: 'KOK CHIEN FUI',
  memberNo: 'SFD6-FP-001',
  type: 'self',
  timestamp: timestamp,
  expiryMinutes: 5,
  signature: ''
};

token.signature = generateSignature(token);

console.log('=== 测试二维码数据 ===');
console.log(JSON.stringify(token, null, 2));
console.log('\n=== 单行格式（用于复制到收银端测试）===');
console.log(JSON.stringify(token));
