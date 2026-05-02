"use client";

import { useSensorStore } from "@/store/useSensorStore";
import { Droplets, Thermometer, Wind, CloudRain } from "lucide-react";

export default function FieldDigitalTwin() {
  const { currentData } = useSensorStore();
  const moisture = Math.round(currentData.soilMoisturePlant);
  const isOpen = currentData.valveOpen;

  // Calculate dynamic colors based on moisture
  // Wet = Forest/Green, Dry = Amber/Brown
  const getSoilColor = () => {
    if (moisture > 60) return "bg-forest";
    if (moisture > 30) return "bg-emerald-700";
    return "bg-amber-800";
  };

  const getGrassColor = () => {
    if (moisture > 60) return "from-emerald-400 to-forest";
    if (moisture > 30) return "from-lime-400 to-emerald-600";
    return "from-yellow-600 to-amber-700";
  };

  return (
    <div className="glass-panel p-8 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-2xl h-[450px]">
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse"></div>
            3D DIGITAL TWIN
          </h3>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Real-time Field Simulation</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-emerald uppercase">Connectivity</span>
            <span className="text-xs font-bold text-white">Arduino Uno V3</span>
          </div>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
        
        {/* The 3D Field Slice */}
        <div 
          className="relative w-64 h-64 transition-all duration-1000 ease-in-out"
          style={{ 
            transform: 'rotateX(60deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Top Layer (Grass/Field) */}
          <div className={`absolute inset-0 rounded-lg shadow-2xl bg-gradient-to-br transition-colors duration-1000 ${getGrassColor()} z-10 translate-z-[20px] border-2 border-white/20 overflow-hidden`}>
             {/* Grid Lines */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             {/* Rain/Water Animation if Valve is Open */}
             {isOpen && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-full h-full bg-blue-400/30 animate-pulse"></div>
                   <div className="absolute grid grid-cols-4 gap-4 animate-bounce">
                      {[...Array(8)].map((_, i) => (
                        <Droplets key={i} className="text-blue-300 w-4 h-4 opacity-70" />
                      ))}
                   </div>
                </div>
             )}
          </div>

          {/* Front Face (Soil/Dirt Depth) */}
          <div className={`absolute top-full left-0 w-full h-[60px] origin-top rotateX-[-90deg] transition-colors duration-1000 ${getSoilColor()} brightness-75 rounded-b-lg`}></div>
          
          {/* Side Face (Soil/Dirt Depth) */}
          <div className={`absolute top-0 left-full h-full w-[60px] origin-left rotateY-[90deg] transition-colors duration-1000 ${getSoilColor()} brightness-50 rounded-r-lg`}></div>
        </div>

        {/* HUD Annotations */}
        <div className="absolute bottom-10 left-10 space-y-4">
           <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <Thermometer className="text-amber-500" size={16} />
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase">Surface</p>
                 <p className="text-sm font-black text-white">{currentData.temperature}°C</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <Wind className="text-emerald" size={16} />
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase">Air Flow</p>
                 <p className="text-sm font-black text-white">{currentData.humidity}%</p>
              </div>
           </div>
        </div>

        <div className="absolute bottom-10 right-10 text-right">
           <div className={`px-4 py-2 rounded-full inline-flex items-center gap-2 border-2 ${isOpen ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-600 text-slate-500'} font-black text-[10px] uppercase tracking-tighter`}>
              {isOpen ? <CloudRain size={12} className="animate-bounce" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
              Valve: {isOpen ? 'Hydrating' : 'Idle'}
           </div>
           <p className="mt-4 text-3xl font-black text-white/20 tracking-tighter uppercase opacity-30 select-none">
              Iso-Link V1.2
           </p>
        </div>
      </div>
    </div>
  );
}
