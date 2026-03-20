'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Check, RefreshCw, Shield, Activity, Terminal, Loader2 } from 'lucide-react'

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

const mockEndpoints = [
  { method: 'GET', path: '/v1/esims', usage: 'High' },
  { method: 'POST', path: '/v1/esims/activate', usage: 'High' },
  { method: 'GET', path: '/v1/plans', usage: 'Medium' },
  { method: 'POST', path: '/v1/orders', usage: 'High' },
  { method: 'GET', path: '/v1/orders/:id', usage: 'Medium' },
  { method: 'DELETE', path: '/v1/esims/:id', usage: 'Low' },
]

export default function APIKeysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [keys, setKeys] = useState<APIKey[]>([])
  const [showKey, setShowKey] = useState<string | null>(null)
  const [fullKeys, setFullKeys] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'test'>('live')
  const [error, setError] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/api-keys')
      if (!res.ok) throw new Error('Failed to fetch API keys')
      const data = await res.json()
      setKeys(data.keys || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchKeys()
    }
  }, [status, router, fetchKeys])

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
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
      if (data.success && data.key) {
        setKeys(prev => [{ ...data.key, maskedKey: data.key.maskedKey }, ...prev])
        setFullKeys(prev => ({ ...prev, [data.key.id]: data.key.fullKey }))
        setShowCreateModal(false)
        setNewKeyName('')
        setNewKeyEnv('live')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete API key')

      setKeys(prev => prev.filter(k => k.id !== id))
      setFullKeys(prev => {
        const newKeys = { ...prev }
        delete newKeys[id]
        return newKeys
      })
      if (showKey === id) setShowKey(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key')
    }
  }

  const copyKey = async (id: string, key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const toggleShowKey = (id: string) => {
    if (showKey === id) {
      setShowKey(null)
    } else {
      setShowKey(id)
      if (!fullKeys[id]) {
        const key = keys.find(k => k.id === id)
        if (key?.fullKey) {
          setFullKeys(prev => ({ ...prev, [id]: key.fullKey! }))
        }
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-slate-900">API Keys</h1><p className="text-xs text-slate-500">Manage your API keys</p></div>
          <Button size="sm" className="gap-1 text-xs h-8" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-3 w-3" />
            Create Key
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 w-full">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-0 text-white"><CardContent className="p-3"><div className="flex items-center gap-2"><Key className="h-4 w-4" /><div><p className="text-xs text-indigo-100">Active Keys</p><p className="text-xl font-bold">{keys.filter(k => k.status === 'active').length}</p></div></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white"><CardContent className="p-3"><div className="flex items-center gap-2"><Activity className="h-4 w-4" /><div><p className="text-xs text-emerald-100">Requests Today</p><p className="text-xl font-bold">16,268</p></div></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-violet-500 to-fuchsia-600 border-0 text-white"><CardContent className="p-3"><div className="flex items-center gap-2"><Shield className="h-4 w-4" /><div><p className="text-xs text-violet-100">Security Score</p><p className="text-xl font-bold">98%</p></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full flex-1">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Terminal className="h-4 w-4 text-indigo-500" />Your API Keys</CardTitle><CardDescription>Keep keys secure. Never share in public repos.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {keys.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No API keys yet</p>
                    <p className="text-xs">Create your first key to get started</p>
                  </div>
                ) : keys.map((key) => (
                  <div key={key.id} className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-lg ${key.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'}`}><Key className={`h-3.5 w-3.5 ${key.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} /></div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5"><p className="font-medium text-sm">{key.name}</p><Badge variant={key.status === 'active' ? 'success' : 'secondary'} className="text-xs">{key.status}</Badge></div>
                          <p className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {showKey === key.id ? (fullKeys[key.id] || key.fullKey || '••••••••••••••••••') : key.maskedKey || `${key.prefix}${'•'.repeat(24)}`}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Created: {new Date(key.createdAt).toLocaleDateString()} | {key.requests} requests</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={() => toggleShowKey(key.id)}>{showKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={() => copyKey(key.id, fullKeys[key.id] || key.fullKey || '')}>{copied === key.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}</Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:text-red-500" onClick={() => handleDeleteKey(key.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-indigo-500" />Security Tips</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {['Never commit keys to repos', 'Rotate keys every 90 days', 'Use environment variables', 'Set up IP allowlisting', 'Monitor usage regularly', 'Revoke unused keys'].map((tip, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600"><Check className="h-3 w-3 text-emerald-500 shrink-0" />{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-sm">API Endpoints</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {mockEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <Badge variant={ep.method === 'GET' ? 'secondary' : ep.method === 'POST' ? 'default' : 'destructive'} className="text-xs shrink-0">{ep.method}</Badge>
                    <span className="text-xs font-mono text-slate-700 flex-1 truncate">{ep.path}</span>
                    <span className={`text-xs shrink-0 ${ep.usage === 'High' ? 'text-red-500' : ep.usage === 'Medium' ? 'text-amber-500' : 'text-slate-400'}`}>{ep.usage}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Create New API Key</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateModal(false)}><Trash2 className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateKey} className="space-y-3">
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
                    <Button type="button" variant="outline" className="flex-1 h-9" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 h-9" disabled={creating}>
                      {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Key'}
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
