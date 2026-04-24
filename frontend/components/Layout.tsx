"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  AlertCircle,
  GitCompare,
  Bell,
  FileText,
  LogOut,
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <div className="hidden md:block w-64 flex-shrink-0">
        <div className="fixed w-64 h-screen border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <SidebarContent />
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <MobileSidebar />
      </div>

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent() {
  const navItems = [
    { name: "Home", href: "/", icon: BarChart3 },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Transactions", href: "/transactions", icon: BarChart3 },
    { name: "Reconciliation", href: "/reconciliation", icon: GitCompare },
    { name: "Alerts", href: "/alerts", icon: AlertCircle },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          PayWatch
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
          Operations Center
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white group"
          >
            <item.icon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-slate-400 hover:text-red-400 group">
          <LogOut className="w-5 h-5 group-hover:animate-pulse" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className="fixed top-4 right-4 z-50 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl">☰</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
          <button className="absolute inset-0 w-full h-full" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
