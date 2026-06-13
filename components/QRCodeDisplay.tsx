'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { generateQRToken, encodeQRToken, getRemainingMinutes, formatRemainingTime, type QRToken } from '@/lib/qr-code';

interface QRCodeDisplayProps {
  shareholderId: number;
  shareholderName: string;
  memberNo: string;
  type: 'self' | 'family';
  familyCard?: { id: number; name: string; relationship: string };
  onClose: () => void;
}

// Simple QR code SVG generator (uses external library in production)
function SimpleQRCode({ data }: { data: string }) {
  // For now, display as text with styling
  // In production, use qrcode.react library
  return (
    <div className="flex aspect-square items-center justify-center rounded-2xl bg-white p-4">
      <div className="text-center">
        <div className="mb-2 text-6xl">📱</div>
        <p className="text-xs text-zinc-400">QR Code</p>
        <p className="mt-2 text-[10px] text-zinc-300 break-all">{data.slice(0, 50)}...</p>
      </div>
    </div>
  );
}

export function QRCodeDisplay({ 
  shareholderId, 
  shareholderName, 
  memberNo, 
  type, 
  familyCard, 
  onClose 
}: QRCodeDisplayProps) {
  const [token, setToken] = useState<QRToken | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [qrData, setQrData] = useState('');

  // Generate new QR code
  const generateNewQR = () => {
    const newToken = generateQRToken(
      shareholderId,
      shareholderName,
      memberNo,
      type,
      familyCard
    );
    setToken(newToken);
    setQrData(encodeQRToken(newToken));
    setRemainingMinutes(newToken.expiryMinutes);
  };

  // Initial generation
  useEffect(() => {
    generateNewQR();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const remaining = getRemainingMinutes(token);
      setRemainingMinutes(remaining);
      
      if (remaining <= 0) {
        generateNewQR(); // Auto-refresh when expired
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  if (!token) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-5"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl bg-zinc-900 p-6"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {type === 'self' ? '股东消费码' : '副卡消费码'}
            </h2>
            <p className="text-sm text-white/50">{shareholderName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="mb-6">
          <SimpleQRCode data={qrData} />
        </div>

        {/* Info */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">会员编号</span>
            <span className="font-mono text-sm text-white">{memberNo}</span>
          </div>
          {familyCard && (
            <>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-white/60">消费人</span>
                <span className="text-sm text-amber-300">{familyCard.name}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-white/60">关系</span>
                <span className="text-sm text-white/50">
                  {familyCard.relationship === 'spouse' ? '配偶' : '子女'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Timer */}
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
            remainingMinutes < 1 
              ? 'bg-red-400/20 text-red-300' 
              : remainingMinutes < 2 
                ? 'bg-amber-400/20 text-amber-300'
                : 'bg-emerald-400/20 text-emerald-300'
          }`}>
            <div className={`h-2 w-2 rounded-full ${
              remainingMinutes < 1 ? 'animate-pulse bg-red-400' : 'bg-emerald-400'
            }`} />
            <span className="text-sm font-medium">
              {formatRemainingTime(remainingMinutes)}
            </span>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={generateNewQR}
          className="w-full rounded-2xl bg-amber-400 py-4 font-bold text-zinc-950 transition hover:bg-amber-300"
        >
          刷新二维码
        </button>

        {/* Instructions */}
        <p className="mt-4 text-center text-xs text-white/40">
          请让收银员扫描此二维码进行核销
        </p>
      </motion.div>
    </motion.div>
  );
}
