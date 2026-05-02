"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  CalendarClock, 
  LineChart, 
  Bell, 
  Settings,
  Leaf,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSensorStore } from "@/store/useSensorStore";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Farm Intelligence', href: '/farm-intelligence', icon: BrainCircuit },
  { name: 'Scheduling', href: '/scheduling', icon: CalendarClock },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Alerts & Logs', href: '/alerts', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSensorStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-slate-dark text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-light text-white shadow-lg shadow-forest/20">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">ERSHAYE</span>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-forest text-white shadow-md relative overflow-hidden" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald rounded-r-md"></div>}
                <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive ? "text-emerald scale-110" : "text-slate-400 group-hover:text-emerald group-hover:scale-110")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-4 text-xs text-slate-300 shadow-inner">
          <p className="font-semibold text-white mb-2 tracking-wide uppercase text-[10px]">System Status</p>
          <div className="flex items-center gap-2 mt-2 bg-white/5 p-2 rounded-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald"></span>
            </span>
            <span className="font-medium text-emerald-400">Online & Connected</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
