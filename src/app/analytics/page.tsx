"use client";

import { useSensorStore } from "@/store/useSensorStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { BarChart3, TrendingDown, Target, Droplet } from "lucide-react";

export default function Analytics() {
  const { historyData } = useSensorStore();

  const data = historyData.map(d => ({
    time: format(new Date(d.timestamp), "HH:mm"),
    Moisture: Math.round(d.soilMoisturePlant),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-dark">Analytics & Insights</h2>
        <p className="text-sm text-slate-500">Historical performance and resource efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="glass-panel p-5 bg-gradient-to-br from-white to-slate-50">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald/10 text-emerald rounded-lg"><Target size={18} /></div>
              <p className="text-sm font-bold text-slate-600">Water Efficiency</p>
           </div>
           <p className="text-3xl font-black text-slate-800">92<span className="text-lg text-slate-500 font-medium">%</span></p>
           <p className="text-xs text-emerald font-semibold mt-2">↑ 4% vs last week</p>
         </div>

         <div className="glass-panel p-5 bg-gradient-to-br from-white to-slate-50">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Droplet size={18} /></div>
              <p className="text-sm font-bold text-slate-600">Est. Water Used</p>
           </div>
           <p className="text-3xl font-black text-slate-800">14<span className="text-lg text-slate-500 font-medium">L</span></p>
           <p className="text-xs text-slate-500 font-semibold mt-2">Past 24 hours</p>
         </div>

         <div className="glass-panel p-5 bg-gradient-to-br from-white to-slate-50">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><TrendingDown size={18} /></div>
              <p className="text-sm font-bold text-slate-600">Soil Drying Rate</p>
           </div>
           <p className="text-3xl font-black text-slate-800">1.2<span className="text-lg text-slate-500 font-medium">%/hr</span></p>
           <p className="text-xs text-amber-500 font-semibold mt-2">Slightly faster than avg</p>
         </div>

         <div className="glass-panel p-5 bg-gradient-to-br from-white to-slate-50">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><BarChart3 size={18} /></div>
              <p className="text-sm font-bold text-slate-600">Crop Health Index</p>
           </div>
           <p className="text-3xl font-black text-slate-800">98<span className="text-lg text-slate-500 font-medium">/100</span></p>
           <p className="text-xs text-emerald font-semibold mt-2">Optimal conditions</p>
         </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-6">Historical Soil Moisture Trends</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="Moisture" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMoisture)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
