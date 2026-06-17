'use client';

import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';

const adminModules = [
  {
    id: 'shareholders',
    title: '股东管理',
    desc: '添加、编辑股东信息，查看股东列表',
    icon: 'users',
    href: '/admin/shareholders',
    color: 'emerald',
  },
  {
    id: 'redemptions',
    title: '核销记录',
    desc: '查看所有核销记录，导出报表',
    icon: 'history',
    href: '/admin/redemptions',
    color: 'amber',
  },
  {
    id: 'cashier',
    title: '收银台',
    desc: '扫码核销股东消费码',
    icon: 'scan',
    href: '/cashier/dashboard',
    color: 'blue',
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-5 pb-8 pt-12">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-8 left-8 h-24 w-24 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-white">管理后台</h1>
          <p className="mt-2 text-sm text-white/60">SFD6 股东俱乐部管理系统</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="px-5 pb-28 pt-6">
        <div className="grid gap-4">
          {adminModules.map((module, index) => (
            <motion.a
              key={module.id}
              href={module.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group rounded-3xl border border-${module.color}-400/30 bg-gradient-to-br from-${module.color}-400/20 to-${module.color}-950/30 p-6 text-white shadow-xl transition hover:from-${module.color}-400/30 hover:to-${module.color}-950/40`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`rounded-2xl bg-${module.color}-400/20 p-4`}>
                    <Icon name={module.icon} className={`h-8 w-8 text-${module.color}-300`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{module.title}</h2>
                    <p className="mt-1 text-sm text-white/60">{module.desc}</p>
                  </div>
                </div>
                <div className="rounded-full bg-white/10 p-2 group-hover:bg-white/20">
                  <Icon name="arrow-right" className="h-5 w-5 text-white/60" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white">快速入口</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href="/admin/shareholders"
              className="rounded-2xl bg-emerald-400/20 px-4 py-3 text-center text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/30"
            >
              + 添加新股东
            </a>
            <a
              href="/cashier/dashboard"
              className="rounded-2xl bg-amber-400/20 px-4 py-3 text-center text-sm font-bold text-amber-300 transition hover:bg-amber-400/30"
            >
              扫码核销
            </a>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Icon name="info" className="h-5 w-5 text-white/40" />
            <p className="text-sm text-white/50">
              需要帮助？联系技术支持
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
