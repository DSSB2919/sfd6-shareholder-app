'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Icon } from './Icon';
import { generateQRToken, encodeQRToken, getRemainingMinutes, formatRemainingTime, getQRTypeDisplayName, type QRToken } from '@/lib/qr-code';

interface QRCodeDisplayProps {
  shareholderId: number;
  shareholderName: string;
  memberNo: string;
  type: 'self' | 'family' | 'referral';
  familyCard?: { id: number; name: string; relationship: string };
  guestName?: string;
  onClose: () => void;
}

export function QRCodeDisplay({
  shareholderId,
  shareholderName,
  memberNo,
  type,
  familyCard,
  guestName,
  onClose
}: QRCodeDisplayProps) {
  const [token, setToken] = useState<QRToken | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [qrData, setQrData] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  // Generate new QR code
  const generateNewQR = () => {
    const newToken = generateQRToken(
      shareholderId,
      shareholderName,
      memberNo,
      type,
      familyCard,
      guestName
    );
    setToken(newToken);
    setQrData(encodeQRToken(newToken));
    setRemainingMinutes(newToken.expiryMinutes);
    setIsExpired(false);
    setGeneratedAt(new Date());
  };

  // Initial generation
  useEffect(() => {
    generateNewQR();
  }, []);

  // Countdown timer - 家属码不自动刷新，只标记过期
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const remaining = getRemainingMinutes(token);
      setRemainingMinutes(remaining);

      if (remaining <= 0) {
        setIsExpired(true);
        // 只有非家属码才自动刷新
        if (type !== 'family') {
          generateNewQR();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token, type]);

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
              {getQRTypeDisplayName(type)}
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
        <div className="mb-6 flex justify-center">
          <div className={`rounded-2xl bg-white p-4 ${isExpired ? 'opacity-50' : ''}`}>
            <QRCodeSVG
              value={qrData}
              size={200}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
        </div>

        {/* 过期提示（家属码） */}
        {isExpired && type === 'family' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-red-400/20 p-3 text-center"
          >
            <p className="text-sm font-bold text-red-300">⚠️ 此二维码已过期</p>
            <p className="mt-1 text-xs text-red-200/80">请重新生成新的家属消费码</p>
          </motion.div>
        )}

        {/* 生成时间（家属码显示） */}
        {type === 'family' && generatedAt && !isExpired && (
          <div className="mb-4 text-center">
            <p className="text-xs text-white/40">
              生成时间：{generatedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="mt-1 text-xs text-amber-300/80">
              💡 截图后请尽快使用
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">会员编号</span>
            <span className="font-mono text-sm text-white">{memberNo}</span>
          </div>
          {type === 'referral' && (
            <>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-white/60">带客股东</span>
                <span className="text-sm text-emerald-300">{shareholderName}</span>
              </div>
              <div className="mt-1 rounded-xl bg-emerald-400/10 px-3 py-2">
                <span className="text-xs text-emerald-300">此消费将计入带客奖励</span>
              </div>
            </>
          )}
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
          className={`w-full rounded-2xl py-4 font-bold text-zinc-950 transition ${
            isExpired && type === 'family'
              ? 'bg-red-400 hover:bg-red-300'
              : 'bg-amber-400 hover:bg-amber-300'
          }`}
        >
          {isExpired && type === 'family' ? '重新生成二维码' : '刷新二维码'}
        </button>

        {/* Instructions */}
        <p className="mt-4 text-center text-xs text-white/40">
          {type === 'family'
            ? '家属码有效期6小时，过期后需重新生成'
            : '请让收银员扫描此二维码进行核销'}
        </p>
      </motion.div>
    </motion.div>
  );
}
