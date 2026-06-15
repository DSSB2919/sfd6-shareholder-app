'use client';

import { Icon } from './Icon';

interface BottomNavProps {
  active: string;
  setActive: (id: string) => void;
}

const items = [
  { id: 'home', label: '首页', icon: 'snow' },
  { id: 'points', label: '积分', icon: 'wallet' },
  { id: 'benefits', label: '福利', icon: 'crown' },
  { id: 'referral', label: '带客', icon: 'users' },
  { id: 'settings', label: '设置', icon: 'settings' },
];

export function BottomNav({ active, setActive }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-zinc-950/90 px-3 py-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs transition ${
                isActive
                  ? 'bg-white text-zinc-950'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon name={item.icon} className="mb-1 h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}