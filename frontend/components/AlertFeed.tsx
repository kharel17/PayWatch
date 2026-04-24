import React from "react";
import { Alert } from "@/types/index";
import { AlertCircle, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import { format } from "date-fns";

interface AlertFeedProps {
  alerts: Alert[];
  isLoading?: boolean;
  onDismiss?: (alertId: string) => void;
  onAlertClick?: (transactionId: string) => void;
}

const severityConfig = {
  critical: {
    icon: AlertOctagon,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500",
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500",
  },
  medium: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500",
  },
  low: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500",
  },
};

export function AlertFeed({ alerts, isLoading, onDismiss, onAlertClick }: AlertFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Monitoring threats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity as keyof typeof severityConfig];
        const Icon = config.icon;
        const isClickable = !!alert.transaction_id;

        return (
          <div
            key={alert.id}
            className={`group relative overflow-hidden bg-slate-900/50 border border-slate-800 rounded-2xl p-4 transition-all hover:bg-slate-800/80 ${isClickable ? 'cursor-pointer ring-1 ring-transparent hover:ring-blue-500/30' : ''}`}
            onClick={() => isClickable && onAlertClick?.(alert.transaction_id!)}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${config.color.replace('text-', 'bg-')}`} />
            
            <div className="flex gap-4">
              <div className={`p-2 rounded-xl ${config.bg} ${config.color} border border-white/5`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-bold text-white truncate">
                    {alert.type.replace(/_/g, " ").toUpperCase()}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {format(new Date(alert.created_at), "HH:mm")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {alert.message}
                </p>
                
                {isClickable && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    <span>Analyze Source</span>
                    <span className="text-xs">→</span>
                  </div>
                )}
              </div>

              {!alert.dismissed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss?.(alert.id);
                  }}
                  className="p-1 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-300 transition-colors self-start"
                  title="Dismiss"
                >
                  <span className="text-lg">×</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
      
      {alerts.length === 0 && (
        <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-500">No active threats detected</p>
        </div>
      )}
    </div>
  );
}
