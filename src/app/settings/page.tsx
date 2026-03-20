'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { signOut } from 'next-auth/react'
import { User, Lock, Key, Bell, Loader2, Eye, EyeOff, Check, X, Copy, RefreshCw, Trash2 } from 'lucide-react'

interface APIKey {
  id: string
  name: string
  prefix: string
  fullKey?: string
  maskedKey?: string
  createdAt: string
  lastUsed: string | null
  status: string
  requests: string
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [apiKeysLoading, setApiKeysLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [fullApiKeys, setFullApiKeys] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'test'>('live')
  const [creatingKey, setCreatingKey] = useState(false)

  const [notifications, setNotifications] = useState([
    { id: 'orders', label: 'Order updates', desc: 'Get notified when orders are processed', enabled: true },
    { id: 'api', label: 'API usage alerts', desc: 'Alert when API usage exceeds 80%', enabled: true },
    { id: 'security', label: 'Security alerts', desc: 'Get notified of suspicious activity', enabled: true },
    { id: 'reports', label: 'Weekly reports', desc: 'Receive weekly usage summaries', enabled: false },
  ])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const fetchApiKeys = useCallback(async () => {
    setApiKeysLoading(true)
    try {
      const res = await fetch('/api/api-keys')
      if (res.ok) {
        const data = await res.json()
        setApiKeys(data.keys || [])
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err)
    } finally {
      setApiKeysLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      setProfile({
        name: session?.user?.name || '',
        email: session?.user?.email || ''
      })
      setLoading(false)
    }
  }, [status, router, session])

  useEffect(() => {
    if (activeTab === 'api-keys' && apiKeys.length === 0) {
      fetchApiKeys()
    }
  }, [activeTab, apiKeys.length, fetchApiKeys])

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) {
      setError('Name and email are required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      await update({ ...session, user: { ...session!.user, name: profile.name, email: profile.email } })
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new) {
      setError('Current and new password are required')
      return
    }

    if (passwords.new !== passwords.confirm) {
      setError('Passwords do not match')
      return
    }

    if (passwords.new.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update password')
      }

      setPasswords({ current: '', new: '', confirm: '' })
      setSuccess('Password updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingKey(true)
    setError(null)

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, environment: newKeyEnv })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create API key')
      }

      const data = await res.json()
      if (data.success) {
        setApiKeys(prev => [{ ...data.key, maskedKey: data.key.maskedKey }, ...prev])
        setFullApiKeys(prev => ({ ...prev, [data.key.id]: data.key.fullKey }))
        setShowCreateKeyModal(false)
        setNewKeyName('')
        setNewKeyEnv('live')
        setSuccess('API key created successfully')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setCreatingKey(false)
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete API key')

      setApiKeys(prev => prev.filter(k => k.id !== id))
      if (showApiKey === id) setShowApiKey(null)
      setSuccess('API key deleted')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key')
    }
  }

  const copyApiKey = async (id: string) => {
    try {
      await navigator.clipboard.writeText(fullApiKeys[id] || '')
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setError('Failed to copy')
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  if (loading || status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!session) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage your account settings</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
            <X className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600 flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-64 shrink-0">
            <Card>
              <CardContent className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Full Name</label>
                      <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Email</label>
                      <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Company</label>
                    <Input placeholder="Your company name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Timezone</label>
                    <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (London)</option>
                      <option>UTC+1 (Paris)</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                      Sign Out
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Current Password</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">New Password</label>
                    <Input 
                      type="password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Confirm New Password</label>
                    <Input 
                      type="password" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Password Requirements:</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2 text-xs text-slate-500">
                        <Check className="h-3 w-3 text-emerald-500" />At least 8 characters
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-500">
                        <Check className="h-3 w-3 text-emerald-500" />Include uppercase and lowercase
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-500">
                        <Check className="h-3 w-3 text-emerald-500" />Include a number
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-500">
                        <Check className="h-3 w-3 text-emerald-500" />Include a special character
                      </li>
                    </ul>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleUpdatePassword} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'api-keys' && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">API Keys</CardTitle>
                      <CardDescription>Manage your API keys for programmatic access</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowCreateKeyModal(true)}><Key className="h-4 w-4 mr-2" />Create Key</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {apiKeysLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      </div>
                    ) : apiKeys.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No API keys yet</p>
                      </div>
                    ) : apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${apiKey.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                              <Key className={`h-4 w-4 ${apiKey.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">{apiKey.name}</span>
                                <Badge variant={apiKey.status === 'active' ? 'success' : 'secondary'}>{apiKey.status}</Badge>
                              </div>
                              <p className="text-sm text-slate-500 font-mono mt-1">
                                {showApiKey === apiKey.id ? (fullApiKeys[apiKey.id] || apiKey.fullKey || '••••••••••••••••••') : apiKey.maskedKey || `${apiKey.prefix}${'•'.repeat(24)}`}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                                <span>Last used: {apiKey.lastUsed || 'Never'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}>
                              {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyApiKey(apiKey.id)}>
                              {copied === apiKey.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteApiKey(apiKey.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">API Documentation</CardTitle>
                    <CardDescription>Learn how to integrate with our API</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                      <p className="text-emerald-400">// Example API Request</p>
                      <p className="mt-2">curl -X GET https://api.esimhub.com/v1/esims \</p>
                      <p>-H "Authorization: Bearer YOUR_API_KEY" \</p>
                      <p>-H "Content-Type: application/json"</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <button 
                        className={`w-11 h-6 rounded-full transition-colors ${item.enabled ? 'bg-indigo-500' : 'bg-slate-200'}`}
                        onClick={() => setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, enabled: !n.enabled } : n))}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {showCreateKeyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateKeyModal(false)}>
            <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Create New API Key</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateKeyModal(false)}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateApiKey} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Key Name</label>
                    <Input required placeholder="Production API Key" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Environment</label>
                    <select required className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newKeyEnv} onChange={(e) => setNewKeyEnv(e.target.value as 'live' | 'test')}>
                      <option value="live">Live</option>
                      <option value="test">Test</option>
                    </select>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-amber-700">Make sure to copy your API key now. You won't be able to see it again after closing this dialog.</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1 h-9" onClick={() => setShowCreateKeyModal(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 h-9" disabled={creatingKey}>
                      {creatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Key'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
