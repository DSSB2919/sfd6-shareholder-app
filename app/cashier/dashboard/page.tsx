'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { formatRM, calculateFoodDeduct, calculateAlcoholDeduct, getDeductPointsByTier } from '@/lib/utils';
import { uploadReceipt, createRedemption, type RedemptionRecord } from '@/lib/supabase';
import { decodeQRToken, validateQRToken, type QRToken } from '@/lib/qr-code';

// html5-qrcode 类型定义
declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

interface ScannedData {
  type: 'self' | 'family' | 'referral';
  shareholder: {
    id: number;
    name: string;
    member_no: string;
    tier: string;
    points_balance: number;
  };
  family_card?: {
    id: number;
    name: string;
    relationship: string;
  };
  is_referral?: boolean;
}

export default function CashierDashboard() {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [foodAmount, setFoodAmount] = useState(0);
  const [alcoholAmount, setAlcoholAmount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [foodInput, setFoodInput] = useState('');
  const [alcoholInput, setAlcoholInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 摄像头扫码相关状态
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  // 加载 html5-qrcode 库
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Html5Qrcode) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.async = true;
      script.onload = () => {
        console.log('html5-qrcode loaded');
      };
      document.body.appendChild(script);
    }
  }, []);

  // 开始摄像头扫码
  const startCameraScan = useCallback(async () => {
    if (typeof window === 'undefined' || !window.Html5Qrcode) {
      setCameraError('扫码库加载中，请稍后再试');
      return;
    }

    // 先检查浏览器是否支持 getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('您的浏览器不支持摄像头功能，请使用最新版 Chrome/Safari/Edge');
      return;
    }

    // 检查是否在 HTTPS 或 localhost 环境
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setCameraError('摄像头功能需要在 HTTPS 环境下使用');
      return;
    }

    setShowCamera(true);
    setCameraError(null);
    setScanning(true);

    try {
      // 先请求摄像头权限
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const qrCodeReader = new window.Html5Qrcode('qr-reader');
      setHtml5QrCode(qrCodeReader);

      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log('QR Code detected:', decodedText);
        // 停止扫描
        qrCodeReader.stop().then(() => {
          setShowCamera(false);
          setScanning(false);
          // 处理扫描结果
          processQRData(decodedText);
        }).catch((err: any) => {
          console.error('Failed to stop scanner:', err);
        });
      };

      const qrCodeErrorCallback = (errorMessage: string) => {
        // 扫码过程中的错误（如没有检测到二维码），可以忽略
        console.log('QR scan error:', errorMessage);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await qrCodeReader.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      );

    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMsg = '无法启动摄像头';
      
      if (error.name === 'NotAllowedError') {
        errorMsg = '摄像头权限被拒绝，请在浏览器设置中允许摄像头访问';
      } else if (error.name === 'NotFoundError') {
        errorMsg = '未找到摄像头设备';
      } else if (error.name === 'NotReadableError') {
        errorMsg = '摄像头被其他应用占用';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setCameraError(errorMsg);
      setScanning(false);
    }
  }, []);

  // 停止摄像头扫码
  const stopCameraScan = useCallback(async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setShowCamera(false);
    setScanning(false);
    setCameraError(null);
  }, [html5QrCode]);

  // Process scanned QR code data
  const processQRData = async (qrData: string) => {
    try {
      const token = decodeQRToken(qrData);
      
      if (!token) {
        alert('无效的二维码格式');
        return false;
      }
      
      const validation = validateQRToken(token);
      
      if (!validation.valid) {
        alert('二维码无效或已过期: ' + validation.error);
        return false;
      }
      
      const response = await fetch(`/api/shareholder?id=${token.shareholderId}`);
      if (!response.ok) {
        alert('无法获取股东信息');
        return false;
      }
      
      const shareholder = await response.json();
      
      setScannedData({
        type: token.type,
        shareholder: {
          id: token.shareholderId,
          name: shareholder.name,
          member_no: shareholder.member_no,
          tier: shareholder.tier,
          points_balance: shareholder.points_balance,
        },
        family_card: token.familyCardId ? {
          id: token.familyCardId,
          name: token.familyName || '',
          relationship: token.relationship || 'child',
        } : undefined,
        is_referral: token.type === 'referral',
      });
      return true;
    } catch (error) {
      console.error('QR processing error:', error);
      alert('二维码处理失败');
      return false;
    }
  };

  // 模拟扫码（用于测试）
  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      import('@/lib/qr-code').then(({ generateQRToken }) => {
        const testToken = generateQRToken(
          1,
          'KOK CHIEN FUI',
          'SFD6-FP-001',
          'self'
        );
        
        processQRData(JSON.stringify(testToken));
        setScanning(false);
      });
    }, 2000);
  };

  // Handle manual QR input
  const [qrInput, setQrInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const handleManualSubmit = async () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const qrData = textarea?.value?.trim() || qrInput.trim();
    
    console.log('Processing QR data:', qrData);
    
    if (!qrData) {
      alert('请输入二维码数据');
      return;
    }
    
    const token = decodeQRToken(qrData);
    console.log('Decoded token:', token);
    
    if (!token) {
      alert('无效的二维码格式');
      return;
    }
    
    const validation = validateQRToken(token);
    console.log('Validation result:', validation);
    
    if (!validation.valid) {
      alert('二维码无效或已过期: ' + validation.error);
      return;
    }
    
    console.log('Fetching shareholder:', token.shareholderId);
    const response = await fetch(`/api/shareholder?id=${token.shareholderId}`);
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      alert('无法获取股东信息');
      return;
    }
    
    const shareholder = await response.json();
    console.log('Shareholder data:', shareholder);
    
    const newScannedData: ScannedData = {
      type: token.type,
      shareholder: {
        id: token.shareholderId,
        name: shareholder.name,
        member_no: shareholder.member_no,
        tier: shareholder.tier,
        points_balance: shareholder.points_balance,
      },
      family_card: token.familyCardId ? {
        id: token.familyCardId,
        name: token.familyName || '',
        relationship: token.relationship || 'child',
      } : undefined,
      is_referral: token.type === 'referral',
    };
    
    console.log('Setting scannedData:', newScannedData);
    
    setQrInput('');
    if (textarea) textarea.value = '';
    setShowManualInput(false);
    setScannedData(newScannedData);
    setForceUpdate(prev => prev + 1);
    
    console.log('scannedData set, should re-render');
  };

  // 计算抵扣
  const shareholderTier = scannedData?.shareholder.tier;
  const foodDeduct = calculateFoodDeduct(foodAmount, shareholderTier);
  const alcoholDeduct = calculateAlcoholDeduct(alcoholAmount, shareholderTier);
  const totalDeduct = foodDeduct + alcoholDeduct;
  const finalPay = foodAmount + alcoholAmount - totalDeduct;

  const deductPoints = shareholderTier ? getDeductPointsByTier(shareholderTier) : { food: 25, alcohol: 10 };

  const handleRedeem = () => {
    if (totalDeduct > (scannedData?.shareholder.points_balance || 0)) {
      alert('积分余额不足');
      return;
    }
    if (!receiptImage) {
      alert('请先上传抵扣单据照片');
      return;
    }
    setShowConfirm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setReceiptFile(file);

    setUploading(true);
    const redemptionId = `RED_${Date.now()}`;
    const publicUrl = await uploadReceipt(file, redemptionId);
    setUploading(false);

    if (publicUrl) {
      setReceiptImage(publicUrl);
      console.log('Receipt uploaded:', publicUrl);
    } else {
      alert('上传失败，请重试');
      setReceiptImage(null);
      setReceiptFile(null);
    }
  };

  const handleFoodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFoodInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setFoodAmount(numValue);
    } else if (value === '') {
      setFoodAmount(0);
    }
  };

  const handleAlcoholInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAlcoholInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAlcoholAmount(numValue);
    } else if (value === '') {
      setAlcoholAmount(0);
    }
  };

  const confirmRedeem = async () => {
    if (!scannedData) return;

    let receiptPath: string | null = null;
    if (receiptImage) {
      const urlParts = receiptImage.split('/');
      receiptPath = `cashier/${urlParts[urlParts.length - 1]}`;
    }

    const redemptionData = {
      shareholder_id: scannedData.shareholder.id,
      shareholder_name: scannedData.shareholder.name,
      shareholder_member_no: scannedData.shareholder.member_no,
      food_amount: foodAmount,
      alcohol_amount: alcoholAmount,
      total_deduct: totalDeduct,
      final_pay: finalPay,
      receipt_url: receiptImage,
      receipt_path: receiptPath,
      status: 'pending' as const,
    };

    const result = await createRedemption(redemptionData);

    if (result) {
      try {
        const weeklyPointsResponse = await fetch('/api/weekly-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shareholder_id: scannedData.shareholder.id,
            redemption_id: result.id,
          }),
        });

        if (!weeklyPointsResponse.ok) {
          const errorData = await weeklyPointsResponse.json();
          console.warn('Weekly points update warning:', errorData);
        }
      } catch (error) {
        console.error('Failed to update weekly points:', error);
      }

      alert('核销成功！');
      setScannedData(null);
      setFoodAmount(0);
      setAlcoholAmount(0);
      setFoodInput('');
      setAlcoholInput('');
      setReceiptImage(null);
      setReceiptFile(null);
      setShowConfirm(false);
    } else {
      alert('核销失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
        
        <div className="relative mb-4">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Icon name="chevron" className="h-4 w-4 rotate-180" />
            返回管理后台
          </a>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Cashier</p>
            <h1 className="mt-1 text-2xl font-black text-white">核销系统</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20">
              <Icon name="history" className="h-5 w-5" />
            </button>
            <button className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20">
              <Icon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28 pt-6">
        {!scannedData ? (
          /* Scan Mode */
          <div className="space-y-6">
            {/* 摄像头扫码区域 */}
            {showCamera ? (
              <div className="rounded-3xl border border-white/10 bg-black p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">扫描二维码</h2>
                  <button
                    onClick={stopCameraScan}
                    className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
                  >
                    <Icon name="close" className="h-5 w-5" />
                  </button>
                </div>
                
                {cameraError ? (
                  <div className="rounded-2xl bg-red-400/10 p-6 text-center">
                    <Icon name="scan" className="mx-auto mb-3 h-12 w-12 text-red-400" />
                    <p className="text-red-300 font-medium">{cameraError}</p>
                    <div className="mt-4 text-sm text-white/60 text-left space-y-2">
                      <p className="font-medium text-white/80">解决方法：</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>确保使用最新版 Chrome/Safari/Edge 浏览器</li>
                        <li>点击地址栏左侧的 🔒 图标，允许摄像头权限</li>
                        <li>确保设备有摄像头且未被其他应用占用</li>
                        <li>在手机上使用效果更佳</li>
                      </ul>
                    </div>
                    <div className="mt-4 flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          setCameraError(null);
                          startCameraScan();
                        }}
                        className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-300"
                      >
                        重试
                      </button>
                      <button
                        onClick={stopCameraScan}
                        className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                      >
                        返回
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      id="qr-reader" 
                      ref={qrReaderRef}
                      className="rounded-2xl overflow-hidden"
                      style={{ width: '100%', minHeight: '300px' }}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-amber-400/50 rounded-lg">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                      </div>
                    </div>
                    <p className="mt-3 text-center text-sm text-white/60">
                      将二维码对准框内即可自动扫描
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-amber-400/10">
                  <Icon name="scan" className="h-16 w-16 text-amber-300" />
                </div>
                <h2 className="text-xl font-bold text-white">扫描股东二维码</h2>
                <p className="mt-2 text-sm text-white/60">
                  请让股东出示App中的消费二维码
                </p>
              </div>
            )}

            {/* 开始扫描按钮 */}
            {!showCamera && (
              <button
                onClick={startCameraScan}
                disabled={scanning}
                className="w-full rounded-2xl bg-amber-400 py-5 text-lg font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
              >
                {scanning ? '启动中...' : '开始扫描'}
              </button>
            )}

            {/* 模拟扫码按钮（测试用） */}
            <button
              onClick={handleScan}
              disabled={scanning || showCamera}
              className="w-full rounded-2xl border border-white/20 bg-transparent py-3 text-sm font-medium text-white/60 transition hover:bg-white/5"
            >
              {scanning ? '扫描中...' : '模拟扫码 (测试)'}
            </button>

            {/* Manual QR Input Toggle */}
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full rounded-2xl border border-white/20 bg-transparent py-3 text-sm font-medium text-white/60 transition hover:bg-white/5"
            >
              {showManualInput ? '隐藏手动输入' : '手动输入二维码数据 (测试)'}
            </button>

            {/* Manual QR Input */}
            {showManualInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <textarea
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="粘贴二维码JSON数据..."
                  className="w-full h-32 rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none font-mono"
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={scanning || !qrInput.trim()}
                  className="w-full rounded-2xl bg-emerald-400/20 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/30 disabled:opacity-50"
                >
                  {scanning ? '处理中...' : '提交二维码'}
                </button>
              </motion.div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-bold text-white">使用说明</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                <li>• 点击"开始扫描"启动摄像头</li>
                <li>• 股东自用码/带客码有效期为 5 分钟</li>
                <li>• 副卡二维码有效期为 6 小时</li>
                <li>• 每RM100可抵扣对应积分，不足部分不抵扣</li>
                <li>• 带客消费将计入股东带客奖励</li>
                <li>• 请确认股东身份后再进行核销</li>
                <li>• 积分不足时将无法完成抵扣</li>
              </ul>
            </div>
          </div>
        ) : showConfirm ? (
          /* Confirm Mode */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
              <Icon name="shield" className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
              <h2 className="text-xl font-bold text-white">确认核销</h2>
              <p className="mt-2 text-sm text-white/60">
                请确认以下信息无误
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-4 font-bold text-white">核销详情</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">股东</span>
                  <span className="font-medium text-white">{scannedData.shareholder.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">编号</span>
                  <span className="font-medium text-white">{scannedData.shareholder.member_no}</span>
                </div>
                {scannedData.family_card && (
                  <div className="flex justify-between">
                    <span className="text-white/60">消费人</span>
                    <span className="font-medium text-amber-300">
                      {scannedData.family_card.name} ({scannedData.family_card.relationship === 'spouse' ? '配偶' : '子女'})
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">食物消费</span>
                    <span className="font-medium text-white">{formatRM(foodAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">酒精消费</span>
                    <span className="font-medium text-white">{formatRM(alcoholAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-300">
                    <span>抵扣积分</span>
                    <span className="font-bold">{totalDeduct} 分</span>
                  </div>
                  {receiptImage && (
                    <div className="mt-3">
                      <span className="text-white/60">单据照片</span>
                      <img src={receiptImage} alt="Receipt" className="mt-2 w-full rounded-xl" />
                    </div>
                  )}
                  <div className="mt-3 flex justify-between border-t border-white/10 pt-3">
                    <span className="text-white/60">实付金额</span>
                    <span className="text-xl font-bold text-amber-300">{formatRM(finalPay)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-2xl border border-white/20 bg-transparent py-4 font-bold text-white hover:bg-white/5"
              >
                返回修改
              </button>
              <button
                onClick={confirmRedeem}
                className="rounded-2xl bg-emerald-400 py-4 font-bold text-zinc-950 hover:bg-emerald-300"
              >
                确认核销
              </button>
            </div>
          </motion.div>
        ) : (
          /* Input Mode */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Shareholder Info */}
            <div className={`rounded-3xl border p-5 ${scannedData.is_referral ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-400/15 to-emerald-950/30' : 'border-amber-300/30 bg-gradient-to-br from-white/15 to-amber-300/10'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-amber-300">{scannedData.shareholder.tier}</p>
                    {scannedData.is_referral && (
                      <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                        带客消费
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white">{scannedData.shareholder.name}</h2>
                  <p className="mt-1 text-sm text-white/60">{scannedData.shareholder.member_no}</p>
                </div>
                <button
                  onClick={() => setScannedData(null)}
                  className="rounded-xl bg-white/10 p-2 text-white/60 hover:text-white"
                >
                  <Icon name="scan" className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-950/50 px-4 py-3">
                <span className="text-sm text-white/60">可用积分</span>
                <span className="text-lg font-bold text-emerald-300">
                  {(scannedData.shareholder.points_balance || 0).toLocaleString()}
                </span>
              </div>
              {scannedData.is_referral && (
                <div className="mt-3 rounded-xl bg-emerald-400/10 px-3 py-2">
                  <p className="text-xs text-emerald-300">✓ 此消费将计入带客奖励</p>
                </div>
              )}
            </div>

            {/* Amount Inputs */}
            <div className="space-y-4">
              {/* Food */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">食物 / 无酒精</h3>
                    <p className="text-xs text-white/50">每RM100抵扣 {deductPoints.food} 分</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300">
                    -{foodDeduct} 分
                  </span>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm text-white/60">输入总额 (RM)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={foodInput}
                    onChange={handleFoodInputChange}
                    placeholder="0.00"
                    className="w-full rounded-xl bg-white px-4 py-3 text-center text-xl font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Alcohol */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">酒精饮料</h3>
                    <p className="text-xs text-white/50">每RM100抵扣 {deductPoints.alcohol} 分</p>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-bold text-amber-300">
                    -{alcoholDeduct} 分
                  </span>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm text-white/60">输入总额 (RM)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={alcoholInput}
                    onChange={handleAlcoholInputChange}
                    placeholder="0.00"
                    className="w-full rounded-xl bg-white px-4 py-3 text-center text-xl font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-4 font-bold text-white">上传抵扣单据</h3>
              {!receiptImage ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-8 transition hover:border-amber-400/50 hover:bg-white/10">
                  <Icon name="camera" className="mb-3 h-10 w-10 text-white/40" />
                  <span className="text-sm text-white/60">点击拍照或选择图片</span>
                  <span className="mt-1 text-xs text-white/40">支持 JPG, PNG (最大 5MB)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              ) : (
                <div className="relative">
                  {uploading ? (
                    <div className="flex h-40 items-center justify-center rounded-2xl bg-white/5">
                      <div className="text-center">
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
                        <span className="text-sm text-white/60">上传中...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={receiptImage}
                        alt="Receipt"
                        className="w-full rounded-2xl"
                      />
                      <button
                        onClick={() => {
                          setReceiptImage(null);
                          setReceiptFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute right-2 top-2 rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500"
                      >
                        <Icon name="close" className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <p className="mt-2 text-center text-xs text-emerald-300">
                    {uploading ? '正在上传到云端...' : '✓ 单据已上传至云端'}
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
              <h3 className="mb-4 font-bold text-white">结算汇总</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>原账单</span>
                  <span>{formatRM(foodAmount + alcoholAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>积分抵扣</span>
                  <span>-{totalDeduct} 分</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-white">实付金额</span>
                  <span className="text-xl font-bold text-amber-300">{formatRM(finalPay)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRedeem}
              disabled={foodAmount + alcoholAmount === 0}
              className="w-full rounded-2xl bg-amber-400 py-5 text-lg font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              确认核销
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}