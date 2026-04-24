import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Layout } from '@/components/Layout'
import { SeedButton } from '@/components/SeedButton'
import { Shield, Zap, BarChart3, Bell } from 'lucide-react'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch recent activity for the status card
  const { data: transactions } = await supabase.from('transactions').select('*').limit(5).order('created_at', { ascending: false })

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-16 px-4">
          <h1 className="text-5xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            PayWatch
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Advanced Payment Transaction Monitoring & Reconciliation Dashboard.
            Secure, real-time analytics for global financial operations.
          </p>

          <div className="flex justify-center gap-4 mb-20">
            <a href="/dashboard" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20">
              Open Dashboard
            </a>
            <SeedButton variant="secondary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-white/5 transition-all">
              <Zap className="text-emerald-400 mb-4 w-10 h-10" />
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Monitoring</h3>
              <p className="text-slate-400 text-sm">Monitor Fonepay, ConnectIPS, and SWIFT transactions in NRS and USD with millisecond latency.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-white/5 transition-all">
              <BarChart3 className="text-blue-400 mb-4 w-10 h-10" />
              <h3 className="text-lg font-bold text-white mb-2">Auto-Reconciliation</h3>
              <p className="text-slate-400 text-sm">Automatically reconcile mobile wallet and bank ledger entries to detect NRS amount mismatches.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-white/5 transition-all">
              <Bell className="text-orange-400 mb-4 w-10 h-10" />
              <h3 className="text-lg font-bold text-white mb-2">Smart Alerting</h3>
              <p className="text-slate-400 text-sm">Get notified instantly of high failure rates on Fonepay rails or large NRS transfers exceeding limits.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:bg-white/5 transition-all">
              <Shield className="text-violet-400 mb-4 w-10 h-10" />
              <h3 className="text-lg font-bold text-white mb-2">Compliance & Security</h3>
              <p className="text-slate-400 text-sm">Enterprise security with RLS enabled, ensuring Nepali financial data is handled with bank-grade protocols.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">System Activity</h2>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          
          {transactions && transactions.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="font-mono text-sm text-blue-400">{tx.reference_code}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{tx.sender} ➔ {tx.receiver}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{tx.amount} {tx.currency}</div>
                    <div className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${
                      tx.status === 'completed' ? 'text-emerald-400' : 
                      tx.status === 'failed' ? 'text-red-400' : 'text-slate-500'
                    }`}>{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No recent activity detected. Use the button above to generate sample traffic.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
