import { NextResponse } from 'next/server';

let valveState = { valveOpen: false };

export async function GET() {
  // Arduino can GET this to know if it should physically open the relay
  return NextResponse.json({ valveOpen: valveState.valveOpen });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (typeof body.valveOpen === 'boolean') {
      valveState.valveOpen = body.valveOpen;
      return NextResponse.json({ success: true, message: `Valve set to ${body.valveOpen ? 'OPEN' : 'CLOSED'}`, state: valveState });
    }
    
    return NextResponse.json({ success: false, message: "Missing valveOpen boolean" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  }
}
