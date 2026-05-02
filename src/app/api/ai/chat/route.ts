import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

/**
 * Handle POST request for AI Chat
 */
export async function POST(req: Request) {
  try {
    const { messages, model, sensorData } = await req.json();

    const systemPrompt = `YOU ARE ERSHAYE AI. THIS IS NOT A DRILL. YOU ARE CONNECTED TO LIVE FARM HARDWARE.
CURRENT DATA SOURCE: ARDUINO UNO
- MOISTURE: ${sensorData?.soilMoisturePlant}%
- TANK: ${sensorData?.soilMoistureTank}%
- TEMP: ${sensorData?.temperature}°C

If you ever say "I don't know the moisture" or give generic advice without checking these numbers, you have FAILED.
Analyze these numbers and tell the user EXACTLY what to do based on their specific live data.`;

    // Add the system prompt as the first guide if missing
    let fullMessages = messages;
    
    // Auto-Routing Logic: Determine intent based on the last user message
    let finalModel = model;
    if (model === 'auto') {
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      const isIrrigationContext = lastMessage.includes('irrigate') || lastMessage.includes('water') || lastMessage.includes('sensor') || lastMessage.includes('valve') || lastMessage.includes('moisture');
      
      finalModel = isIrrigationContext ? 'gemini' : 'groq-llama3';
    }
    
    if (finalModel === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY missing in server. Please add it to .env.local' }, { status: 500 });
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const aiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = systemPrompt + "\n\nUser History:\n" + messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
      
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      return NextResponse.json({ text: response.text() + (model === 'auto' ? '\n\n*(Routed to Gemini due to hardware context)*' : '') });
      
    } else if (finalModel === 'groq-llama3') {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'GROQ_API_KEY missing in server. Please add it to .env.local' }, { status: 500 });
      }
      
      const groq = new Groq({ apiKey });
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];
      
      const completion = await groq.chat.completions.create({
        messages: apiMessages,
        model: "llama-3.3-70b-versatile",
      });
      
      return NextResponse.json({ text: (completion.choices[0]?.message?.content || "No response") + (model === 'auto' ? '\n\n*(Routed to Groq for general prompt)*' : '') });
    } else {
      return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 });
    }

  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
