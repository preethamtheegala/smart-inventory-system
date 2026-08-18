'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { User } from '@/lib/types'
import { toast } from 'sonner'
import {
  Package,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Boxes
} from 'lucide-react'

interface LoginViewProps {
  onLoginSuccess: (user: User) => void
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password.')
      return
    }

    setLoading(true)
    try {
      const data = await api.login({ username: username.trim(), password: password.trim() })
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('token', data.token)
      toast.success(`Welcome back, ${data.username}! Logged in as ${data.role}.`)
      onLoginSuccess(data)
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (role: 'owner' | 'cashier') => {
    if (role === 'owner') {
      setUsername('owner')
      setPassword('owner123')
    } else {
      setUsername('cashier')
      setPassword('cashier123')
    }
    toast.info(`Filled ${role} demo credentials. Click Sign In to continue.`)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#090d16] overflow-hidden px-4 py-12">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-[#111827]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/60 transition-all">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 ring-4 ring-blue-500/10">
              <Boxes className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Smart Inventory
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Cloud Inventory & Real-Time POS Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. owner or cashier"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Demo Credentials:
              </span>
              <span className="text-[11px] text-slate-500">Click to autofill</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoCredentials('owner')}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300">Owner</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">owner / owner123</div>
                <div className="text-[10px] text-slate-500 mt-1">Full Management</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('cashier')}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">Cashier</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">cashier / cashier123</div>
                <div className="text-[10px] text-slate-500 mt-1">Sales & POS View</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
