"use client";

import { useState, useEffect } from "react";
import { useSensorStore } from "@/store/useSensorStore";
import { Plus, Clock, SkipForward, PowerOff, CheckCircle2, MoreVertical, Calendar, Loader2, Trash2, Edit2, X, AlertCircle, Info } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Scheduling() {
  const { currentData } = useSensorStore();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    time: "06:00 AM",
    duration: "15 min",
    days: "Daily",
    conditionDry: true,
    conditionTank: true,
    active: true
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_URL}?action=schedules`);
      if (!res.ok) throw new Error("Hardware backend offline");
      const data = await res.json();
      setSchedules(data || []);
      setError(null);
    } catch (err) {
      setError("Hardware Server Offline. Please run: npm run dev:all in the wabii folder");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = editingId ? { ...formData, id: editingId } : { ...formData, id: Date.now() };
    
    try {
      const res = await fetch(`${API_URL}?action=schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      
      if (editingId) {
        setSchedules(schedules.map(s => s.id === editingId ? payload : s));
      } else {
        setSchedules([...schedules, result.data]);
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const openEdit = (sched: any) => {
    setEditingId(sched.id);
    setFormData({ ...sched });
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      time: "08:00 AM",
      duration: "10 min",
      days: "Daily",
      conditionDry: true,
      conditionTank: true,
      active: true
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (sched: any) => {
    const updated = { ...sched, active: !sched.active };
    try {
      await fetch(`${API_URL}?action=schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setSchedules(schedules.map(s => s.id === sched.id ? updated : s));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteSchedule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await fetch(`${API_URL}?action=schedules&id=${id}`, {
        method: "DELETE",
      });
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-emerald h-10 w-10" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Smart Scheduling</h2>
          <p className="text-sm text-slate-500 font-medium">Configure high-precision watering intervals.</p>
        </div>
        
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald to-forest text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-emerald/20 hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={20} /> New Cycle
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-3xl text-amber-900 shadow-sm flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 bg-amber-200 rounded-2xl"><Info className="text-amber-700" size={24} /></div>
          <div className="flex-1">
             <p className="font-black text-lg">Backend Communication Interrupted</p>
             <p className="text-sm font-medium opacity-80">{error}</p>
          </div>
          <button onClick={fetchSchedules} className="bg-amber-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-amber-700 transition-all">Reconnect</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-8">
        {schedules.map((sched) => (
          <div key={sched.id} className={`glass-panel p-8 border-t-8 transition-all duration-500 relative group overflow-hidden ${sched.active ? 'border-t-emerald shadow-2xl shadow-emerald/5' : 'border-t-slate-300 opacity-60'}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-inner ${sched.active ? 'bg-emerald/10 text-emerald' : 'bg-slate-100 text-slate-400'}`}>
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{sched.time}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sched.days}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(sched)} className="p-2 bg-slate-100 text-slate-600 hover:bg-emerald hover:text-white rounded-xl transition-all shadow-sm">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteSchedule(sched.id)} className="p-2 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><Calendar size={14}/> Water Duration</span>
                <span className="font-black text-slate-800">{sched.duration}</span>
              </div>
              
              <div className="px-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Skip if Moisture {">"} 70%</span>
                    {sched.conditionDry ? <CheckCircle2 size={18} className="text-emerald" /> : <X size={18} className="text-slate-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Auto-lock if Tank {"<"} 10%</span>
                    {sched.conditionTank ? <CheckCircle2 size={18} className="text-emerald" /> : <X size={18} className="text-slate-300" />}
                  </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
               <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${sched.active ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-slate-100 text-slate-400'}`}>
                 {sched.active ? 'SYSTEM READY' : 'PAUSED'}
               </span>
               <button 
                onClick={() => toggleStatus(sched)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-md ${sched.active ? 'bg-emerald' : 'bg-slate-300'}`}
               >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${sched.active ? 'translate-x-7' : 'translate-x-1'}`} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-emerald to-forest p-8 text-white relative">
                <h3 className="text-2xl font-black">{editingId ? 'Edit Irrigation Cycle' : 'New Irrigation Cycle'}</h3>
                <p className="text-sm opacity-80 font-medium">Configure your hardware automation.</p>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">START TIME</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 06:00 AM" 
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-emerald outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DURATION</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 15 min" 
                            value={formData.duration}
                            onChange={(e) => setFormData({...formData, duration: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-emerald outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OCCURRENCE</label>
                    <select 
                        value={formData.days}
                        onChange={(e) => setFormData({...formData, days: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-emerald outline-none transition-all appearance-none"
                    >
                        <option value="Daily">Every Day (Daily)</option>
                        <option value="Mon, Wed, Fri">Mon, Wed, Fri</option>
                        <option value="Tue, Thu, Sat">Tue, Thu, Sat</option>
                        <option value="Weekends">Weekends (Sun, Sat)</option>
                    </select>
                </div>

                <div className="space-y-4 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HARDWARE CONDITIONS</p>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <SkipForward className="text-amber-500" size={18} />
                            <span className="text-sm font-bold text-slate-700">Soil Moisture Threshold</span>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={formData.conditionDry}
                            onChange={(e) => setFormData({...formData, conditionDry: e.target.checked})}
                            className="w-5 h-5 accent-emerald cursor-pointer" 
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <PowerOff className="text-red-500" size={18} />
                            <span className="text-sm font-bold text-slate-700">Tank Safety Switch</span>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={formData.conditionTank}
                            onChange={(e) => setFormData({...formData, conditionTank: e.target.checked})}
                            className="w-5 h-5 accent-emerald cursor-pointer" 
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-emerald text-white py-4 rounded-3xl font-black shadow-xl shadow-emerald/20 hover:bg-forest transition-all mt-4"
                >
                    {editingId ? 'COMMIT CHANGES' : 'CREATE AUTOMATION'}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

