"use client";

import { useSensorStore } from "@/store/useSensorStore";
import { AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function AlertsLogs() {
  const { alerts, logs, markAlertRead } = useSensorStore();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="text-red-500" />;
      case 'warning': return <AlertTriangle className="text-amber-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical': return "bg-red-50 border-red-100";
      case 'warning': return "bg-amber-50 border-amber-100";
      default: return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col h-full space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-dark">System Alerts</h2>
          <p className="text-sm text-slate-500">Real-time hardware notifications.</p>
        </div>

        <div className="flex-1 glass-panel p-6 overflow-y-auto space-y-4">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <CheckCircle className="h-10 w-10 mb-2 text-emerald/50" />
              <p>No active alerts. All systems nominal.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl border ${getAlertBg(alert.type)} ${!alert.read ? 'shadow-sm' : 'opacity-70'} transition-all`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-800 capitalize">{alert.type} Alert</h4>
                      <span className="text-xs text-slate-500">{format(new Date(alert.timestamp), "MMM d, HH:mm")}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                    {!alert.read && (
                      <button 
                        onClick={() => markAlertRead(alert.id)}
                        className="mt-3 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-3 py-1.5 rounded-lg"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col h-full space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-dark">Event Logs</h2>
          <p className="text-sm text-slate-500">Audit trail of system actions.</p>
        </div>

        <div className="flex-1 glass-panel p-6 overflow-y-auto">
          <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-4">
            {logs.map((log, idx) => (
              <div key={log.id} className="relative pl-6">
                <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-slate-300 ring-4 ring-white"></span>
                <div className="mb-1 text-xs font-semibold text-slate-400">
                  {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                </div>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3">
                  {log.action}
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-slate-500 pl-6">No events logged yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
