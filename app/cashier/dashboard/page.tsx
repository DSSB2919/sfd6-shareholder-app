'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { formatRM, calculateFoodDeduct, calculateAlcoholDeduct } from '@/lib/utils';
import { uploadReceipt } from '@/lib/supabase';

interface ScannedData {
  type: 'self' | 'family';
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

  // Mock scan function
  const handleScan = () => {
    setScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setScannedData({
        type: 'self',
        shareholder: {
          id: 1,
          name: 'MR. LEE WEN CHUIN',
          member_no: 'SFD6-FP-001',
          tier: 'Founding Partner',
          points_balance: 185000,
        },
      });
      setScanning(false);
    }, 2000);
  };

  const foodDeduct = calculateFoodDeduct(foodAmount);
  const alcoholDeduct = calculateAlcoholDeduct(alcoholAmount);
  const totalDeduct = foodDeduct + alcoholDeduct;
  const finalPay = foodAmount + alcoholAmount - totalDeduct;

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

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setReceiptFile(file);

    // Upload to Supabase
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
    // Process redemption with receipt URL
    const redemptionData = {
      shareholderId: scannedData?.shareholder.id,
      shareholderName: scannedData?.shareholder.name,
      foodAmount,
      alcoholAmount,
      totalDeduct,
      finalPay,
      receiptUrl: receiptImage,
      timestamp: new Date().toISOString(),
    };

    console.log('Redemption data:', redemptionData);
    // TODO: Send to backend API to save redemption record

    alert('核销成功！');
    setScannedData(null);
    setFoodAmount(0);
    setAlcoholAmount(0);
    setFoodInput('');
    setAlcoholInput('');
    setReceiptImage(null);
    setReceiptFile(null);
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 px-5 pb-6 pt-8">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
        
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
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-amber-400/10">
                <Icon name="scan" className="h-16 w-16 text-amber-300" />
              </div>
              <h2 className="text-xl font-bold text-white">扫描股东二维码</h2>
              <p className="mt-2 text-sm text-white/60">
                请让股东出示App中的消费二维码
              </p>
            </div>

            <button
              onClick={handleScan}
              disabled={scanning}
              className="w-full rounded-2xl bg-amber-400 py-5 text-lg font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              {scanning ? '扫描中...' : '开始扫描'}
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-bold text-white">使用说明</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/60">
                <li>• 股东二维码有效期为 5 分钟</li>
                <li>• 副卡二维码有效期为 6 小时</li>
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
            <div className="rounded-3xl border border-amber-300/30 bg-gradient-to-br from-white/15 to-amber-300/10 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-amber-300">{scannedData.shareholder.tier}</p>
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
                  {scannedData.shareholder.points_balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Amount Inputs */}
            <div className="space-y-4">
              {/* Food */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">食物 / 无酒精</h3>
                    <p className="text-xs text-white/50">抵扣 30%</p>
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
                    <p className="text-xs text-white/50">抵扣 10%</p>
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