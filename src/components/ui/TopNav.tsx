"use client";

import { Bell, Menu, User } from "lucide-react";
import { useSensorStore } from "@/store/useSensorStore";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function TopNav() {
  const { currentData, alerts } = useSensorStore();
  const unreadAlerts = alerts.filter(a => !a.read).length;
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-border bg-white/80 px-4 md:px-6 backdrop-blur-md sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => useSensorStore.getState().setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-dark">ERSHAYE Irrigation</h1>
          <p className="text-xs font-medium text-slate-500">
            {time ? format(time, "EEEE, MMMM do yyyy") : "Loading..."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 mr-4 rounded-full bg-slate-50 px-4 py-2 border border-slate-100 hidden sm:flex">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${currentData.valveOpen ? 'bg-emerald' : 'bg-slate-300'}`} />
            <span className="text-xs font-semibold text-slate-600">Valve {currentData.valveOpen ? 'Open' : 'Closed'}</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${currentData.soilMoistureTank > 10 ? 'bg-emerald' : 'bg-red-500'}`} />
            <span className="text-xs font-semibold text-slate-600">Tank {currentData.soilMoistureTank > 10 ? 'OK' : 'Low'}</span>
          </div>
        </div>

        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadAlerts > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-critical text-[10px] font-bold text-white">
              {unreadAlerts}
            </span>
          )}
        </button>

        <div className="h-9 w-9 rounded-full bg-forest text-white flex items-center justify-center shadow-md">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
