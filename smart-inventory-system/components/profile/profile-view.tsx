'use client'

import { useState, useEffect } from 'react'
import { User, UserProfile } from '@/lib/types'
import { api } from '@/lib/api'
import {
  UserCheck,
  Shield,
  KeyRound,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  ShieldAlert
} from 'lucide-react'
import { toast } from 'sonner'

interface ProfileViewProps {
  user: User
  onLogout: () => void
}

export function ProfileView({ user, onLogout }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Password change state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProfile()
        setProfile(data)
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      })
      if (res.token) {
        localStorage.setItem('token', res.token)
      }
      toast.success('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const isOwner = user.role === 'owner'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 ring-4 ring-slate-800">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-100 capitalize">
                  {user.username}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isOwner
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isOwner ? 'Executive Owner' : 'POS Cashier'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {profile?.email || `${user.username}@enterprise.local`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-xs text-slate-400 hidden sm:block">
              <div>Session Status: <span className="text-emerald-400 font-semibold">Active & Secured</span></div>
              <div className="text-[11px] text-slate-500">Token-based DRF Auth</div>
            </div>
          </div>
        </div>

        {/* Detailed Account Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800 mt-6 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Assigned Role Privilege</span>
            <span className="font-bold text-slate-200 capitalize">
              {isOwner ? 'Full Administrator (CRUD, Adjustments, Analytics)' : 'Cashier (POS Sales & Stock Lookups)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Account Created</span>
            <span className="font-bold text-slate-200">
              {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'System Default'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Last Successful Login</span>
            <span className="font-bold text-slate-200">
              {profile?.last_login ? new Date(profile.last_login).toLocaleDateString() : 'Current Session'}
            </span>
          </div>
        </div>
      </div>

      {/* Role Capabilities Card */}
      <div className="p-6 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          Role Permissions Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Granted Operations
            </div>
            <ul className="text-slate-300 space-y-1 pl-5 list-disc">
              <li>Process POS retail sales transactions</li>
              <li>Issue sales invoices & receipts</li>
              <li>View catalog stock levels & search</li>
              <li>View customer purchase history</li>
              {isOwner && (
                <>
                  <li>Add, edit, and delete products & pricing</li>
                  <li>Inbound procurement & supplier purchase orders</li>
                  <li>Manual stock adjustments with audit trail</li>
                  <li>View financial P&L, gross margins, and reports</li>
                  <li>View system activity logs</li>
                </>
              )}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Security Safeguards
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isOwner
                ? 'All financial actions, product adjustments, and delete events are strictly audited in the activity log.'
                : 'Cashier accounts are restricted by Django DRF server-side permissions from deleting records, modifying supplier pricing, or adjusting stock manually.'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Update Account Password</h3>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading || !oldPassword || !newPassword}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {passwordLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
