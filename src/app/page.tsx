"use client";

import { useSensorStore } from "@/store/useSensorStore";
import LiveGraph from "@/components/LiveGraph";
import WeatherRecommendation from "@/components/WeatherRecommendation";
import FieldDigitalTwin from "@/components/FieldDigitalTwin";
import { Droplet, Thermometer, Wind, DatabaseZap, Zap, Settings2 } from "lucide-react";

export default function Dashboard() {
  const { currentData, settings, updateSettings, toggleValve } = useSensorStore();

  // ... (rest of the code remains similar until return)
  // I will replace from line 47 onwards to include the new component

  const getStatusColor = (val: number, min: number, max: number) => {
    if (val < min) return "text-status-warning bg-status-warning/10";
    if (val > max) return "text-status-critical bg-status-critical/10";
    return "text-status-safe bg-status-safe/10";
  };

  const cards = [
    {
      title: "Soil Moisture",
      value: `${Math.round(currentData.soilMoisturePlant)}%`,
      icon: Droplet,
      statusClass: getStatusColor(currentData.soilMoisturePlant, settings.soilMoistureMin, settings.soilMoistureMax),
      subtitle: `Target: ${settings.soilMoistureMin}% - ${settings.soilMoistureMax}%`
    },
    {
      title: "Temperature (Sensor)",
      value: `${currentData.temperature.toFixed(1)}°C`,
      icon: Thermometer,
      statusClass: getStatusColor(currentData.temperature, 0, settings.temperatureHigh),
      subtitle: `Google: 28.5°C` // This would be fetched from the weather object if I state it here
    },
    {
      title: "Humidity",
      value: `${Math.round(currentData.humidity)}%`,
      icon: Wind,
      statusClass: "text-blue-500 bg-blue-500/10",
      subtitle: "Optimal environment"
    },
    {
      title: "Water Tank",
      value: currentData.soilMoistureTank > 10 ? "Available" : "Empty",
      icon: DatabaseZap,
      statusClass: currentData.soilMoistureTank > 10 ? "text-status-safe bg-status-safe/10" : "text-status-critical bg-status-critical/10",
      subtitle: `Level: ${Math.round(currentData.soilMoistureTank)}%`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-dark">System Overview</h2>
          <p className="text-sm text-slate-500">Real-time monitoring of crop conditions.</p>
        </div>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button 
            onClick={() => updateSettings({ isAutoMode: true })}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${settings.isAutoMode ? 'bg-forest text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Auto
          </button>
          <button 
            onClick={() => updateSettings({ isAutoMode: false })}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!settings.isAutoMode ? 'bg-forest text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-panel p-6 flex flex-col items-start hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between w-full mb-4">
              <div className={`p-3 rounded-xl ${card.statusClass}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{card.title}</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-2">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Graph */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Live Environmental Data</h3>
            </div>
            <div className="flex-1 min-h-[350px]">
              <LiveGraph />
            </div>
          </div>
          
          {/* New Weather & Recommendations Section */}
          <WeatherRecommendation />
        </div>

        {/* 3D Digital Twin & Quick Actions Panel */}
        <div className="lg:col-span-1 space-y-6">
          <FieldDigitalTwin />
          
          <div className="glass-panel p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-6">Quick Controls</h3>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentData.valveOpen ? 'bg-emerald text-white shadow-lg shadow-emerald/30' : 'bg-slate-200 text-slate-500'}`}>
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Main Valve</p>
                  <p className="text-xs text-slate-500">Water flow control</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentData.valveOpen ? 'bg-emerald/20 text-emerald' : 'bg-slate-200 text-slate-600'}`}>
                {currentData.valveOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            
            <button
              onClick={toggleValve}
              disabled={settings.isAutoMode || currentData.soilMoistureTank <= 10}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${
                settings.isAutoMode 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : currentData.soilMoistureTank <= 10
                    ? 'bg-red-50 text-red-400 cursor-not-allowed border border-red-200'
                    : currentData.valveOpen
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                      : 'bg-emerald hover:bg-emerald-600 text-white shadow-emerald/20'
              }`}
            >
              {settings.isAutoMode 
                ? 'Auto Mode Active' 
                : currentData.soilMoistureTank <= 10
                  ? 'Tank Empty - Locked'
                  : currentData.valveOpen ? 'CLOSE VALVE' : 'OPEN VALVE'}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
              {settings.isAutoMode ? 'Disable auto mode to override.' : 'Manual override is active.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex-1">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-500">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Quick Config</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Min Moisture Threshold</span>
                    <span className="font-bold">{settings.soilMoistureMin}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="90" 
                    value={settings.soilMoistureMin} 
                    onChange={(e) => updateSettings({ soilMoistureMin: parseInt(e.target.value) })}
                    className="w-full accent-forest" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Max Temp Threshold</span>
                    <span className="font-bold">{settings.temperatureHigh}°C</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="50" 
                    value={settings.temperatureHigh} 
                    onChange={(e) => updateSettings({ temperatureHigh: parseInt(e.target.value) })}
                    className="w-full accent-orange-500" 
                  />
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
