"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SeedButtonProps {
  variant?: 'primary' | 'secondary'
}

export function SeedButton({ variant = 'primary' }: SeedButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/stats/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.refresh(); // Refresh server component data
      } else {
        alert('Action failed: ' + (data.error || data.message));
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (variant === 'secondary') {
    return (
      <button 
        onClick={handleSeed}
        disabled={loading}
        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-all border border-slate-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Run Simulation'}
      </button>
    )
  }

  return (
    <button 
      onClick={handleSeed}
      disabled={loading}
      className={`px-4 py-2 ${loading ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50`}
    >
      {loading ? '...' : '⚡ Generate Mock Data'}
    </button>
  )
}
