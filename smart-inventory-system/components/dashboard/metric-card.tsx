'use client'

import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon: LucideIcon
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose'
  trend?: string
}

const colorStyles = {
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
    borderGlow: 'hover:border-blue-500/40',
    accentText: 'text-blue-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    borderGlow: 'hover:border-emerald-500/40',
    accentText: 'text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
    borderGlow: 'hover:border-amber-500/40',
    accentText: 'text-amber-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20',
    borderGlow: 'hover:border-purple-500/40',
    accentText: 'text-purple-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
    borderGlow: 'hover:border-rose-500/40',
    accentText: 'text-rose-400',
  },
}

export function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color = 'blue',
  trend
}: MetricCardProps) {
  const styles = colorStyles[color]

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 p-5 shadow-lg shadow-black/20 transition-all duration-200 ${styles.borderGlow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          {value}
        </div>
        {(sublabel || trend) && (
          <div className="mt-1.5 flex items-center gap-2">
            {trend && (
              <span className={`text-[11px] font-semibold ${styles.accentText}`}>
                {trend}
              </span>
            )}
            {sublabel && (
              <span className="text-xs text-slate-400">
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
