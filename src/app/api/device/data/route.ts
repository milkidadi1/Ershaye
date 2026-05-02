import { NextResponse } from 'next/server';

// In-memory store for simulation API endpoints
let deviceData = {
  soilMoisturePlant: 45,
  soilMoistureTank: 85,
  temperature: 24.5,
  humidity: 55,
  valveOpen: false,
  timestamp: Date.now()
};

export async function GET() {
  return NextResponse.json(deviceData);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Update server state with data from the hardware (Arduino POSTing here)
    if (body.soilMoisturePlant !== undefined) deviceData.soilMoisturePlant = body.soilMoisturePlant;
    if (body.soilMoistureTank !== undefined) deviceData.soilMoistureTank = body.soilMoistureTank;
    if (body.temperature !== undefined) deviceData.temperature = body.temperature;
    if (body.humidity !== undefined) deviceData.humidity = body.humidity;
    
    deviceData.timestamp = Date.now();

    return NextResponse.json({ success: true, message: "Data received successfully", data: deviceData });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  }
}
