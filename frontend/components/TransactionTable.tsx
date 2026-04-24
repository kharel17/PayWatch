import React from "react";
import { Transaction } from "@/types/index";
import { format } from "date-fns";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}

const statusBadgeClasses = {
  completed: "badge-success",
  failed: "badge-error",
  delayed: "badge-warning",
  returned: "badge-gray",
};

export function TransactionTable({
  transactions,
  isLoading,
  onTransactionClick,
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-400">Fetching transaction ledger...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30">
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reference</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sender / Receiver</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rail</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transactions.map((txn) => (
              <tr
                key={txn.id}
                className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => onTransactionClick?.(txn)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-blue-400 group-hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30 transition-colors">
                    {txn.reference_code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-200">{txn.sender}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">➔ {txn.receiver}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="text-sm font-bold text-white">
                    {txn.currency} {txn.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    {txn.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    txn.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
                    txn.status === 'failed' ? 'bg-red-400/10 text-red-400 border-red-400/20' : 
                    'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    {txn.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="text-xs text-slate-400">
                    {format(new Date(txn.created_at), "MMM dd, yyyy")}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {format(new Date(txn.created_at), "HH:mm")}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <span className="text-2xl text-slate-500">∅</span>
          </div>
          <h3 className="text-white font-bold mb-1">No Transactions Found</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            The ledger is currently empty. Run a simulation to generate activity.
          </p>
        </div>
      )}
    </div>
  );
}
