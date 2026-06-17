'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 初始状态
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // 恢复网络后显示3秒提示
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed left-1/2 top-0 z-[100] mt-4 -translate-x-1/2 rounded-full px-4 py-2 shadow-lg ${
            isOnline
              ? 'bg-emerald-400/90 text-zinc-950'
              : 'bg-red-400/90 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={isOnline ? 'check' : 'info'}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">
              {isOnline ? '网络已恢复' : '网络已断开，请检查网络连接'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
