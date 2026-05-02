"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSensorStore } from "@/store/useSensorStore";
import { Send, Bot, Sparkles, CheckCircle2, ChevronRight, Droplets, LineChart, Settings, User } from "lucide-react";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isActionable?: boolean;
  actionConfidence?: number;
  dataReferences?: {
    moisture: number;
    temp: number;
    humidity: number;
  };
}

export default function AiAssistant() {
  const { currentData, toggleValve } = useSensorStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your **ERSHAYE AI**, your digital farm expert. I'm ready to monitor your fields! How can I help you today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("auto");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAIResponse = async (userText: string) => {
    setIsTyping(true);
    
    // Default action fallback analysis
    let actionable = false;
    let conf = 90;
    const q = userText.toLowerCase();

    if (q.includes("irrigate") || q.includes("water") || q.includes("dry")) {
      const moisture = currentData.soilMoisturePlant;
      const temp = currentData.temperature;
      if (moisture < 40 && temp > 30) {
        actionable = true;
        conf = 98;
      } else if (moisture < 50) {
        actionable = true;
        conf = 85;
      }
    }

    try {
      // API Call
      const conversationHistory = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: 'user', content: userText }],
          model: selectedModel,
          sensorData: currentData
        })
      });

      const data = await res.json();
      
      let aiResponse: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: data.text || (data.error ? `**API Error**: ${data.error}` : "I couldn't generate a response."),
        isActionable: actionable,
        actionConfidence: conf,
        dataReferences: actionable ? { moisture: currentData.soilMoisturePlant, temp: currentData.temperature, humidity: currentData.humidity } : undefined
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: "Sorry, I am having trouble connecting to my brain right now. You can switch to the Offline Mode.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    generateAIResponse(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white">
              <Image src="/farmer-avatar.png" alt="ERSHAYE AI" fill className="object-cover" />
           </div>
           <div>
            <h2 className="text-3xl font-black text-emerald-900 tracking-tight">ERSHAYE AI</h2>
            <p className="text-sm text-slate-500 font-bold italic">Your 3D Digital Farm Expert</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-2 border-b-4 border-b-forest/10">
          <Settings className="w-4 h-4 text-slate-400 ml-2" />
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-sm font-bold focus:outline-none text-slate-700 cursor-pointer pr-4"
          >
            <option value="auto">Auto-Routing (Gemini/Groq)</option>
            <option value="local-mock">Offline Mode (ERSHAYE AI Logic)</option>
          </select>
        </div>
      </div>

      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-around bg-gradient-to-r from-emerald/10 to-forest/10 border-emerald/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald text-white rounded-xl shadow-lg shadow-emerald/20"><Droplets className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Moisture</p>
            <p className="text-xl font-black text-slate-800">{Math.round(currentData.soilMoisturePlant)}%</p>
          </div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-emerald/20"></div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20"><LineChart className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Temp</p>
            <p className="text-xl font-black text-slate-800">{currentData.temperature.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-emerald/20"></div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white text-emerald rounded-xl shadow-md"><Sparkles className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">AI Insight</p>
            <p className="text-xs font-bold text-emerald-600">Costume: Farmer ✅</p>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden border-2 border-emerald/5">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.map(msg => (
            <div key={msg.id} className={`flex max-w-[90%] ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
              {msg.sender === 'ai' && (
                <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden flex items-center justify-center mr-4 shrink-0 shadow-lg border-2 border-emerald self-start">
                  <Image src="/farmer-avatar.png" alt="Yene Redat" width={48} height={48} className="object-cover" />
                </div>
              )}
              
              <div className={`space-y-3 ${msg.sender === 'user' ? 'bg-forest text-white rounded-3xl rounded-tr-none px-6 py-4 shadow-xl shadow-forest/10' : ''}`}>
                {msg.sender === 'ai' ? (
                  <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-none px-6 py-5 shadow-sm">
                    <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-[15px]">
                      {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-emerald-700">{part}</strong> : part)}
                    </div>
                    
                    {msg.dataReferences && (
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-3 text-xs border border-slate-100">
                          <span className="text-slate-500 block mb-1 font-bold">SOIL MOISTURE</span>
                          <span className="font-black text-lg text-forest">{Math.round(msg.dataReferences.moisture)}%</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 text-xs border border-slate-100">
                          <span className="text-slate-500 block mb-1 font-bold">TEMP READING</span>
                          <span className="font-black text-lg text-amber-600">{msg.dataReferences.temp.toFixed(1)}°C</span>
                        </div>
                      </div>
                    )}

                    {msg.isActionable && (
                      <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 bg-emerald/10 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                          <CheckCircle2 size={14} />
                          {msg.actionConfidence}% Confidence
                        </div>
                        <button 
                          onClick={async () => {
                            toggleValve();
                            // Sync with PHP
                            try {
                                await fetch("http://localhost:5000/api?action=valve", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ open: !currentData.valveOpen })
                                });
                            } catch (e) {}
                            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "**Success!** I've opened the valve for you. Watering has started."}]);
                          }}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald hover:bg-forest text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-emerald/20 transition-all hover:scale-105 active:scale-95"
                        >
                          OPEN VALVE NOW <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[15px] font-medium">{msg.text}</div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex max-w-[85%]">
               <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden flex items-center justify-center mr-4 shrink-0 shadow-lg border-2 border-emerald opacity-50">
                  <Image src="/farmer-avatar.png" alt="Ref" width={48} height={48} className="object-cover grayscale" />
               </div>
              <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-none px-6 py-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="relative flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask ERSHAYE AI anything about your farm..."
              className="flex-1 bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald/10 focus:border-emerald transition-all shadow-inner font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-4 bg-emerald hover:bg-forest disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl transition-all shadow-xl shadow-emerald/10 active:scale-90"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
