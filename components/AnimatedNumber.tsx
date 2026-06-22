'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  className = '',
  format = (n) => (n || 0).toLocaleString(),
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    // 首次加载时从0开始动画
    if (!hasAnimated) {
      startValueRef.current = 0;
      startTimeRef.current = null;
      setHasAnimated(true);
    } else {
      // 后续更新时从当前值开始
      startValueRef.current = displayValue;
      startTimeRef.current = null;
    }

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // 使用 easeOutQuart 缓动函数
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentValue = Math.round(
        startValueRef.current + (value - startValueRef.current) * easeOutQuart
      );

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, hasAnimated]);

  return <span className={className}>{format(displayValue)}</span>;
}
