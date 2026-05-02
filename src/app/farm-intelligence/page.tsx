"use client";

import { useState, useEffect } from "react";
import { useSensorStore } from "@/store/useSensorStore";
import { 
  FileText, 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Droplets, 
  CloudSun 
} from "lucide-react";

export default function FarmIntelligence() {
  const { currentData } = useSensorStore();
  const [report, setReport] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<{q: string, a: string}[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate a live report based on data
  useEffect(() => {
    let summary = `Your farm is currently in an **${currentData.soilMoisturePlant > 40 ? 'Optimal' : 'Attention Needed'}** state. `;
    summary += `With a soil moisture of **${currentData.soilMoisturePlant.toFixed(1)}%**, your plants are ${currentData.soilMoisturePlant > 40 ? 'well-hydrated' : 'approaching drought stress'}. `;
    summary += `Environmental conditions are ${currentData.temperature > 30 ? 'Warm' : 'Mild'} at **${currentData.temperature.toFixed(1)}°C**. `;
    summary += `Current Water Reservoir is at **${currentData.soilMoistureTank.toFixed(1)}%**, which is ${currentData.soilMoistureTank > 20 ? 'sufficient for next 3 cycles' : 'critical, refill recommended'}.`;
    setReport(summary);
  }, [currentData]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
          model: 'auto',
          sensorData: currentData
        })
      });
      const data = await res.json();
      setAnswers(prev => [{ q: question, a: data.text }, ...prev]);
      setQuestion("");
    } catch (err) {
      console.error("Q&A Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FileText className="text-forest" size={32} /> Farm Intelligence
          </h2>
          <p className="text-sm text-slate-500 font-medium">AI-driven diagnostics and expert advice.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Report */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 border-t-8 border-t-forest bg-gradient-to-b from-forest/5 to-white shadow-xl">
             <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="text-forest" size={20} />
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Status Report</h3>
             </div>
             
             <div className="prose prose-slate max-w-none">
                <div className="text-slate-700 leading-relaxed font-medium">
                  {report.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-forest">{part}</strong> : part)}
                </div>
             </div>

             <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Irrigation Score</span>
                  <span className="text-forest font-black">9.2/10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Resource Health</span>
                  <span className="text-emerald font-black">Stable</span>
                </div>
             </div>
          </div>

          <div className="glass-panel p-6 bg-slate-900 text-white">
             <h4 className="text-sm font-black mb-4 flex items-center gap-2">
                <Activity size={16} className="text-emerald" /> Hardware Pulse
             </h4>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[10px] text-slate-400 font-bold">SOIL</p>
                   <p className="text-xl font-black">{currentData.soilMoisturePlant}%</p>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-bold">TEMP</p>
                   <p className="text-xl font-black">{currentData.temperature}°C</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Q&A */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <MessageSquare size={120} />
             </div>
             
             <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                Ask Digital Expert <Sparkles className="text-amber-500" size={24} />
             </h3>
             <p className="text-slate-500 text-sm mb-8">Ask specific questions about your crops or current hardware readings.</p>

             <div className="relative mb-10">
                <input 
                  type="text" 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder="e.g. Is it safe to skip watering tonight?"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-[32px] px-8 py-6 text-lg font-bold focus:border-forest outline-none shadow-inner transition-all"
                />
                <button 
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  className="absolute right-4 top-4 p-4 bg-forest text-white rounded-[24px] shadow-lg shadow-forest/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
             </div>

             <div className="space-y-6">
                {loading && (
                  <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-[32px] animate-pulse">
                     <Sparkles className="text-amber-500 animate-spin" />
                     <p className="font-bold text-slate-500 italic">Consulting agricultural models...</p>
                  </div>
                )}

                {answers.map((item, i) => (
                  <div key={i} className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-2 ml-4">
                       <div className="w-2 h-2 rounded-full bg-forest"></div>
                       <p className="text-[10px] font-black text-slate-400 uppercase">{item.q}</p>
                    </div>
                    <div className="bg-white border-2 border-slate-100 p-8 rounded-[40px] rounded-tl-none shadow-sm">
                       <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                          {item.a}
                       </p>
                    </div>
                  </div>
                ))}

                {answers.length === 0 && !loading && (
                   <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px]">
                      <Droplets className="text-slate-300 mb-4" size={48} />
                      <p className="text-slate-400 font-bold">No queries yet. Start by asking a question above.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* NEW: Global Satellite Insights Section (NASA/FAO) */}
      <div className="animate-in slide-in-from-top-4 duration-700 delay-200">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <CloudSun className="text-forest" size={24} /> Global Satellite Insights (NASA & FAO)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 bg-white border-l-4 border-l-emerald">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NASA SMAP</p>
                <div className="px-2 py-1 bg-emerald/10 rounded text-[9px] font-bold text-emerald-700 uppercase">Live Mapping</div>
             </div>
             <p className="text-xs font-bold text-slate-500 mb-1">Soil Moisture Anomaly</p>
             <p className="text-2xl font-black text-slate-800">+12% <span className="text-xs text-emerald font-bold">Above Avg</span></p>
             <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald w-[75%] rounded-full"></div>
             </div>
          </div>

          <div className="glass-panel p-6 bg-white border-l-4 border-l-forest">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MODIS NDVI</p>
                <div className="px-2 py-1 bg-forest/10 rounded text-[9px] font-bold text-forest-700 uppercase">Photosynthesis</div>
             </div>
             <p className="text-xs font-bold text-slate-500 mb-1">Vegetation Health Index</p>
             <p className="text-2xl font-black text-slate-800">0.78 <span className="text-xs text-forest font-bold">Excellent</span></p>
             <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-forest w-[88%] rounded-full"></div>
             </div>
          </div>

          <div className="glass-panel p-6 bg-white border-l-4 border-l-amber-500">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LANDSAT 9</p>
                <div className="px-2 py-1 bg-amber-500/10 rounded text-[9px] font-bold text-amber-700 uppercase">Thermal Map</div>
             </div>
             <p className="text-xs font-bold text-slate-500 mb-1">Surface Temperature</p>
             <p className="text-2xl font-black text-slate-800">24.2°C <span className="text-xs text-amber-600 font-bold">Optimal</span></p>
             <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[62%] rounded-full"></div>
             </div>
          </div>

          <div className="glass-panel p-6 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col justify-center items-center text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Open-Source Hubs</p>
             <div className="flex gap-4">
                <a href="https://earthdata.nasa.gov/" target="_blank" className="p-2 bg-white rounded-xl shadow-sm hover:scale-110 transition-transform">
                   <img src="https://www.nasa.gov/favicon.ico" alt="NASA" className="w-6 h-6 grayscale hover:grayscale-0 transition-all" />
                </a>
                <a href="https://www.fao.org/giews/en/" target="_blank" className="p-2 bg-white rounded-xl shadow-sm hover:scale-110 transition-transform">
                   <img src="https://www.fao.org/favicon.ico" alt="FAO" className="w-6 h-6 grayscale hover:grayscale-0 transition-all" />
                </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
