"use client";

import React from 'react';
import { X, ArrowRight, Calendar, Landmark, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Transaction } from '@/types';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  alertMessage?: string | null;
  onClose: () => void;
}

export function TransactionDetails({ transaction, alertMessage, onClose }: TransactionDetailsProps) {
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState<string | null>(null);

  if (!transaction) return null;

  const handleAction = async (action: string) => {
    setIsProcessing(action);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(null);
    setIsSuccess(action);
    
    if (action === 'resolve') {
      setTimeout(() => {
        onClose();
        setIsSuccess(null);
      }, 1000);
    } else {
      setTimeout(() => setIsSuccess(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl h-screen overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white">Transaction Details</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">{transaction.reference_code}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {alertMessage && (
          <div className="mx-6 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-center animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs font-bold text-red-200 uppercase tracking-wide">
              Investigation Triggered: <span className="text-white ml-1">{alertMessage}</span>
            </div>
          </div>
        )}

        <div className="p-8 space-y-8">
          {/* Header Info */}
          <div className="text-center p-6 bg-slate-800/30 rounded-3xl border border-slate-800">
            <div className={`text-4xl font-extrabold mb-2 ${
              transaction.status === 'completed' ? 'text-emerald-400' : 
              transaction.status === 'failed' ? 'text-red-400' : 'text-orange-400'
            }`}>
              {transaction.currency} {(transaction.amount || 0).toLocaleString()}
            </div>
            <div className="flex justify-center items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                transaction.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 
                transaction.status === 'failed' ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 
                'bg-slate-400/10 text-slate-400 border border-slate-400/20'
              }`}>
                {transaction.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 text-[10px] font-bold uppercase tracking-wider">
                {transaction.rail}
              </span>
            </div>
          </div>

          {/* Flow */}
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Sender</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 font-bold">
                  {transaction.sender.charAt(0)}
                </div>
                <div className="font-bold text-white text-lg">{transaction.sender}</div>
              </div>
            </div>

            <div className="flex justify-center py-2">
              <ArrowRight className="text-slate-700 w-6 h-6" />
            </div>

            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Receiver</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 font-bold">
                  {transaction.receiver.charAt(0)}
                </div>
                <div className="font-bold text-white text-lg">{transaction.receiver}</div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Risk Assessment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-800/20 rounded-2xl border border-slate-800/50">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Risk Score</div>
                <div className="flex items-end gap-2">
                  <div className={`text-2xl font-bold ${
                    transaction.status === 'failed' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {transaction.status === 'failed' ? '84/100' : '12/100'}
                  </div>
                  <div className="text-[10px] text-slate-500 pb-1">High Risk</div>
                </div>
              </div>
              <DetailItem icon={<ShieldCheck />} label="KYC Status" value="Verified" color="text-emerald-400" />
            </div>
          </div>

          {/* Technical Context (If Failed) */}
          {transaction.status === 'failed' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Technical Logs</h3>
              <div className="p-4 bg-red-400/5 border border-red-400/20 rounded-2xl font-mono text-[11px] text-red-200/60 space-y-1">
                <div className="text-red-400 font-bold mb-2 uppercase">[Error Source: {transaction.rail}]</div>
                <div>&gt; Initializing {transaction.rail} protocol...</div>
                <div>&gt; Sending payload to gateway...</div>
                <div className="text-red-300">&gt; FATAL: {transaction.failure_reason || "Unknown Rail Error"}</div>
                <div>&gt; Connection terminated by peer.</div>
              </div>
            </div>
          )}

          {/* Resolution Actions */}
          <div className="pt-8 border-t border-slate-800 space-y-3">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">Resolution Actions</h3>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={!!isProcessing}
                  onClick={() => handleAction('flag')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-slate-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {isProcessing === 'flag' ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : 
                   isSuccess === 'flag' ? <span className="text-emerald-400">Flagged ✓</span> : "Flag for Review"}
                </button>
                <button 
                  disabled={!!isProcessing}
                  onClick={() => handleAction('retry')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isProcessing === 'retry' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
                   isSuccess === 'retry' ? "Retried ✓" : "Retry Transaction"}
                </button>
             </div>
             <button 
               disabled={!!isProcessing}
               onClick={() => handleAction('resolve')}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
             >
               {isProcessing === 'resolve' ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : 
                isSuccess === 'resolve' ? "Resolved ✓" : "Mark as Resolved"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  return (
    <div className="p-4 bg-slate-800/20 rounded-2xl border border-slate-800/50">
      <div className="flex items-center gap-2 mb-2 text-slate-500">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-3 h-3' })}
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-bold ${color || 'text-slate-200'}`}>{value}</div>
    </div>
  );
}
