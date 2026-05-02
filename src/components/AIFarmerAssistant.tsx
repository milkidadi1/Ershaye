"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, Send, X, ArrowRight, Loader2, Play } from "lucide-react";

export default function AIFarmerAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askFarmer = async () => {
    if (!query) return;
    setLoading(true);
    setResponse(null);
    
    try {
      // In a real app, this would call your AI endpoint
      // Mocking a helpful farmer response
      setTimeout(() => {
        const responses = [
          "Howdy! Based on your soil data, I reckon you should increase irrigation by 10% this evening. The forecast shows a dry spell coming!",
          "Great question! Your Wheat crop is lookin' healthy, but keep an eye on that temperature. If it hits 30°C, make sure the mulch is thick.",
          "I've checked the sensors. The water tank is a bit low, but we've got enough for two more cycles. Maybe wait for the morning dew?",
          "Your soil moisture is at 62%, which is perfect for Rice. No need to worry for at least 24 hours!"
        ];
        setResponse(responses[Math.floor(Math.random() * responses.length)]);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setResponse("Sorry, my tractor's stuck! Can't reach the server right now.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 glass-panel overflow-hidden shadow-2xl border-emerald/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-emerald to-forest p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">ERSHAYE AI</h4>
                <p className="text-[10px] opacity-80">Online & Ready to help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 bg-slate-50 min-h-[300px] max-h-[400px] overflow-y-auto space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                <Image src="/farmer-avatar.png" alt="Farmer" width={32} height={32} />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700">
                Hello! I'm your ERSHAYE AI. How can I assist you with your farming today?
              </div>
            </div>

            {response && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                  <Image src="/farmer-avatar.png" alt="Farmer" width={32} height={32} />
                </div>
                <div className="bg-emerald/5 border border-emerald/10 p-3 rounded-2xl rounded-tl-none text-sm text-slate-800 font-medium">
                  {response}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-emerald overflow-hidden flex-shrink-0 border-2 border-white opacity-50"></div>
                <div className="bg-slate-200 h-10 w-24 rounded-2xl rounded-tl-none"></div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask about your crops..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askFarmer()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all"
            />
            <button 
              onClick={askFarmer}
              disabled={loading || !query}
              className="bg-emerald text-white p-2 rounded-xl hover:bg-forest transition-colors shadow-lg shadow-emerald/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button / 3D Avatar */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center p-0.5 rounded-full bg-gradient-to-tr from-emerald to-forest shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${isOpen ? 'rotate-12' : ''}`}
      >
        <div className="absolute -top-3 -left-3 bg-white px-2 py-0.5 rounded-full shadow-lg border border-slate-100 animate-bounce duration-[2000ms]">
            <p className="text-[10px] font-black text-emerald flex items-center gap-1">
                <Play size={8} className="fill-emerald" /> AI ACTIVE
            </p>
        </div>
        
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white relative bg-white">
            <Image 
                src="/farmer-avatar.png" 
                alt="3D Farmer Avatar" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
        </div>
        
        <div className="absolute -bottom-1 -right-1 bg-emerald text-white p-1.5 rounded-full border-2 border-white shadow-lg">
            <MessageSquare size={16} />
        </div>
      </button>
    </div>
  );
}
