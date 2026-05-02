"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Leaf, Info, MapPin, Wind, Thermometer, Droplet, Calculator } from "lucide-react";
import { useSensorStore } from "@/store/useSensorStore";

const API_URL = "http://localhost:5000/api";

export default function WeatherRecommendation() {
  const { currentData } = useSensorStore();
  const [weather, setWeather] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Weather
      const weatherRes = await fetch(`${API_URL}?action=weather`);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      // Fetch Recommendations based on current sensor data
      const recRes = await fetch(`${API_URL}?action=recommendation&moisture=${currentData.soilMoisturePlant}&temp=${currentData.temperature}`);
      const recData = await recRes.json();
      setRecommendations(recData.recommendations);
    } catch (err) {
      console.error("Error fetching weather/recs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    condition = condition.toLowerCase();
    if (condition.includes("sun") || condition.includes("clear")) return <Sun className="text-amber-400" />;
    if (condition.includes("rain") || condition.includes("showers")) return <CloudRain className="text-blue-400" />;
    return <Cloud className="text-slate-400" />;
  };

  if (loading) return <div className="p-4 text-center text-slate-400 animate-pulse">Loading intelligence...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Weather Forecast vs Real Data */}
      <div className="glass-panel p-6 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Cloud size={100} />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="text-forest" size={18} /> Weather Intelligence
          </h3>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-indigo-500/20">
            Source: Google Maps Weather
          </span>
        </div>

        <div className="flex items-center gap-6 mb-6">
            <div className="text-center p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100 flex-1">
                <p className="text-[10px] text-indigo-500 font-bold uppercase mb-1">Google Weather</p>
                <div className="flex items-center justify-center gap-2">
                    {getWeatherIcon(weather?.current?.condition || "")}
                    <span className="text-3xl font-black text-slate-800">{weather?.current?.temp}°C</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{weather?.current?.condition}</p>
            </div>
            
            <div className="text-center p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex-1">
                <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Live Sensor</p>
                <div className="flex items-center justify-center gap-2">
                    <Thermometer className="text-emerald-500" size={24} />
                    <span className="text-3xl font-black text-slate-800">{currentData.temperature.toFixed(1)}°C</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">On-Site Reading</p>
            </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Calculator size={12} /> Forecast History Comparison
          </p>
          <div className="grid grid-cols-4 gap-2">
            {weather?.forecast?.map((f: any, i: number) => (
              <div key={i} className="bg-slate-50/50 border border-slate-100 p-2 rounded-xl text-center hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-bold text-slate-500 mb-1">{f.day}</p>
                <div className="flex justify-center mb-1 text-slate-600">
                    {getWeatherIcon(f.condition)}
                </div>
                <p className="text-xs font-black text-slate-800">{f.temp}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crop Recommendation */}
      <div className="glass-panel p-6 border-t-4 border-t-emerald overflow-hidden relative">
        <div className="absolute -bottom-10 -right-10 opacity-5">
            <Leaf size={180} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Leaf className="text-emerald" size={18} /> Crop Advisor
          </h3>
          <button onClick={fetchData} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <Info size={14} className="text-slate-400" />
          </button>
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-4 relative z-10">
            <div className="bg-emerald/5 border border-emerald/10 p-4 rounded-2xl">
                <div className="flex items-start gap-4">
                    <div className="bg-emerald text-white p-2.5 rounded-xl shadow-lg shadow-emerald/20">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Top Recommendation</p>
                        <h4 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                           {recommendations[0].icon} {recommendations[0].name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">Perfectly matches current soil moisture {currentData.soilMoisturePlant}%</p>
                    </div>
                </div>
            </div>

            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Other Suitable Alternatives</p>
                <div className="flex flex-wrap gap-2">
                    {recommendations.slice(1, 4).map((crop, i) => (
                        <div key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald"></div> {crop.name}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400 italic">Analyzing soil data for recommendations...</p>
          </div>
        )}
      </div>
    </div>
  );
}
