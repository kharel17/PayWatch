"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ReconciliationTable } from "@/components/ReconciliationTable";
import { fetchReconciliationItems, resolveReconciliationItem } from "@/lib/api";
import { ReconciliationItem, Transaction } from "@/types/index";
import { TransactionDetails } from "@/components/TransactionDetails";

export default function ReconciliationPage() {
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await fetchReconciliationItems();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (error) {
      console.error("Failed to load reconciliation items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    const interval = setInterval(loadItems, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (itemId: string) => {
    try {
      await resolveReconciliationItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to resolve item:", error);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reconciliation</h1>
          <p className="text-slate-400">
            {items.length} open discrepancies -{" "}
            {items.filter((i) => i.status === "resolved").length} resolved
          </p>
        </div>

        <ReconciliationTable
          items={items}
          isLoading={loading}
          onResolve={handleResolve}
          onItemClick={async (txId) => {
            const res = await fetch(`http://localhost:8000/api/transactions/${txId}`);
            const data = await res.json();
            if (data && data.success) setSelectedTransaction(data.data);
          }}
        />

        <TransactionDetails 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      </div>
    </Layout>
  );
}
