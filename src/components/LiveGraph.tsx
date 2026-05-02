"use client";

import { useState, useEffect } from "react";
import { useSensorStore } from "@/store/useSensorStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

export default function LiveGraph() {
  const { historyData } = useSensorStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = historyData.map(d => ({
    time: format(new Date(d.timestamp), "HH:mm"),
    "Soil Moisture": Math.round(d.soilMoisturePlant),
    "Temperature": Math.round(d.temperature),
    "Humidity": Math.round(d.humidity),
  }));

  if (!isMounted) return <div className="h-[350px] w-full bg-slate-50 animate-pulse rounded-2xl" />;

  return (
    <div className="h-[350px] w-full min-h-[350px]">
      <ResponsiveContainer width="99%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="monotone" 
            dataKey="Soil Moisture" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#10b981', border: '2px solid white' }}
          />
          <Line 
            type="monotone" 
            dataKey="Temperature" 
            stroke="#f59e0b" 
            strokeWidth={3}
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="Humidity" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
