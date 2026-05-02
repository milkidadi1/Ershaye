"use client";

import { useSensorStore } from "@/store/useSensorStore";
import { Sliders, Save, Cpu, Zap, Activity } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { settings, updateSettings, addLog } = useSensorStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    addLog("System settings updated remotely.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-dark">Hardware Configuration</h2>
        <p className="text-sm text-slate-500">Fine-tune sensor thresholds and operational modes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Sliders className="text-forest h-5 w-5" />
            <h3 className="text-lg font-bold">Moisture Thresholds</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Minimum (Trigger Irrigation)</span>
                <span className="text-sm font-bold text-emerald">{localSettings.soilMoistureMin}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={localSettings.soilMoistureMin} 
                onChange={e => setLocalSettings(s => ({ ...s, soilMoistureMin: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Maximum (Stop Irrigation)</span>
                <span className="text-sm font-bold text-forest">{localSettings.soilMoistureMax}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={localSettings.soilMoistureMax} 
                onChange={e => setLocalSettings(s => ({ ...s, soilMoistureMax: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-forest"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Activity className="text-amber-500 h-5 w-5" />
            <h3 className="text-lg font-bold">Climate Thresholds</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Critical High Temperature</span>
                <span className="text-sm font-bold text-amber-500">{localSettings.temperatureHigh}°C</span>
              </div>
               <input 
                type="range" min="20" max="60" 
                value={localSettings.temperatureHigh} 
                onChange={e => setLocalSettings(s => ({ ...s, temperatureHigh: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs text-slate-400 mt-2">Triggers heat-stress logic in Auto Mode.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
             <Cpu className="text-indigo-500 h-5 w-5" />
            <h3 className="text-lg font-bold">System Operation Mode</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setLocalSettings(s => ({ ...s, isAutoMode: true }))}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${localSettings.isAutoMode ? 'border-forest bg-forest/5' : 'border-slate-200 hover:border-forest/50'}`}
            >
              <h4 className="font-bold text-slate-800 mb-1">Automatic Control</h4>
              <p className="text-xs text-slate-500">System autonomously controls the valve based on thresholds and connected AI constraints.</p>
              <div className="mt-3 flex items-center gap-2">
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${localSettings.isAutoMode ? 'border-forest' : 'border-slate-300'}`}>
                    {localSettings.isAutoMode && <div className="w-2 h-2 rounded-full bg-forest"></div>}
                 </div>
                 <span className="text-sm font-bold opacity-80">Enable</span>
              </div>
            </div>

            <div 
              onClick={() => setLocalSettings(s => ({ ...s, isAutoMode: false }))}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${!localSettings.isAutoMode ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-400'}`}
            >
              <h4 className="font-bold text-slate-800 mb-1">Manual Mode</h4>
              <p className="text-xs text-slate-500">Overrides all logic. You have full manual control over the relay to trigger the solenoid valve.</p>
              <div className="mt-3 flex items-center gap-2">
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!localSettings.isAutoMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    {!localSettings.isAutoMode && <div className="w-2 h-2 rounded-full bg-slate-800"></div>}
                 </div>
                 <span className="text-sm font-bold opacity-80">Enable</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
             <div className="flex flex-col">
               <span className="text-sm font-bold flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Pulse Irrigation Mode</span>
               <span className="text-xs text-slate-500">Alternates ON/OFF cycles during active irrigation to prevent runoff.</span>
             </div>
             
             <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localSettings.pulseMode}
                onChange={e => setLocalSettings(s => ({ ...s, pulseMode: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all"
        >
          <Save size={18} /> Apply Hardware Settings
        </button>
      </div>
    </div>
  );
}
