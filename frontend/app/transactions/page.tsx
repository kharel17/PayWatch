"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { TransactionTable } from "@/components/TransactionTable";
import { fetchTransactions } from "@/lib/api";
import { Transaction } from "@/types/index";
import { TransactionDetails } from "@/components/TransactionDetails";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ status: "", type: "" });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetchTransactions(offset, 100, filters);
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [offset, filters]);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Transactions</h1>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Filter by status..."
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 bg-slate-800 rounded border border-slate-700 text-white placeholder-slate-500"
            />
            <input
              type="text"
              placeholder="Filter by type..."
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 bg-slate-800 rounded border border-slate-700 text-white placeholder-slate-500"
            />
            <button
              onClick={() => setFilters({ status: "", type: "" })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <TransactionTable 
          transactions={transactions} 
          isLoading={loading} 
          onTransactionClick={setSelectedTransaction} 
        />

        <TransactionDetails 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <p className="text-slate-400">
            Showing {offset + 1} to{" "}
            {Math.min(offset + 100, offset + transactions.length)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - 100))}
              disabled={offset === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-white disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + 100)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-white transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
