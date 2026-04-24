import React from "react";
import { ReconciliationItem } from "@/types/index";
import { format } from "date-fns";

interface ReconciliationTableProps {
  items: ReconciliationItem[];
  isLoading?: boolean;
  onResolve?: (itemId: string) => void;
  onItemClick?: (transactionId: string) => void;
}

const discrepancyLabels: { [key: string]: string } = {
  amount_mismatch: "Amount Mismatch",
  missing_settlement: "Missing Settlement",
  duplicate_reference_code: "Duplicate Reference",
  settlement_overdue: "Settlement Overdue",
};

export function ReconciliationTable({
  items,
  isLoading,
  onResolve,
  onItemClick,
}: ReconciliationTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-400">Analyzing statement discrepancies...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/30">
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Discrepancy Type</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detection Date</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item) => (
              <tr
                key={item.id}
                className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => item.transaction_id && onItemClick?.(item.transaction_id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {discrepancyLabels[item.discrepancy_type] || item.discrepancy_type}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {item.id.split('-')[0]}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded border border-emerald-400/10">
                    {item.expected_value}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-red-400 bg-red-400/5 px-2 py-1 rounded border border-red-400/10">
                    {item.actual_value}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    item.status === 'open' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' : 
                    'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="text-xs text-slate-400">
                    {format(new Date(item.created_at), "MMM dd, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {item.status === "open" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve?.(item.id);
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-900/20"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 text-emerald-500">
            ✓
          </div>
          <h3 className="text-white font-bold mb-1">Fully Reconciled</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            No active discrepancies found between your internal records and bank statements.
          </p>
        </div>
      )}
    </div>
  );
}
