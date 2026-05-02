const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const PORT = 5000;
const ARDUINO_PATH = 'COM8'; // <-- Updated to your port
const STORAGE_FILE = path.join(__dirname, 'storage.json');

// --- Hardware Initialization with Crash-Guard ---
let port;
function connectHardware() {
  try {
    port = new SerialPort({ path: ARDUINO_PATH, baudRate: 9600 });
    
    port.on('open', () => console.log(`\n✅ Hardware: Connected to Arduino on ${ARDUINO_PATH}`));
    
    // Safety: Handle disconnected events
    port.on('close', () => {
      console.log(`\n⚠️ Hardware: Connection lost. Retrying in 5 seconds...`);
      setTimeout(connectHardware, 5000);
    });

    port.on('error', (err) => {
      // Prevents process crash if port not found
      console.log(`\n❌ Hardware Error: ${err.message}`);
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    parser.on('data', (d) => {
      const v = d.split(',');
      if (v.length === 4) {
        lastData = { 
          soil: parseFloat(v[0]), 
          tank: parseFloat(v[1]), 
          temp: parseFloat(v[2]), 
          humidity: parseFloat(v[3]), 
          timestamp: new Date().toISOString() 
        };
        io.emit('sensorData', lastData);
      }
    });
  } catch (err) {
    console.log(`\n⚠️ Hardware: Initial connection failed. Retrying...`);
    setTimeout(connectHardware, 5000);
  }
}

connectHardware();

let lastData = { soil: 0, tank: 0, temp: 0, humidity: 0, timestamp: new Date().toISOString() };

// --- Storage Logic ---
if (!fs.existsSync(STORAGE_FILE)) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify({
    schedules: [
      { id: 1, time: "06:00 AM", duration: "15 min", days: "Daily", active: true }
    ],
    valve_open: false
  }, null, 2));
}
const getS = () => JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
const saveS = (d) => fs.writeFileSync(STORAGE_FILE, JSON.stringify(d, null, 2));

// --- Socket.IO Relay Logic ---
io.on('connection', (s) => {
  s.emit('sensorData', lastData);
  s.on('relay', (cmd) => { 
    if (port && port.isOpen) {
      port.write(`${cmd}\n`, (err) => {
        if (err) console.log("Transmission error:", err.message);
      }); 
    }
  });
});

// --- API (Unified Endpoints) ---
app.all('/api', (req, res) => {
  const { action, moisture, temp, id } = req.query;
  const db = getS();

  if (action === 'schedules') {
    if (req.method === 'GET') return res.json(db.schedules);
    if (req.method === 'POST') {
      const input = req.body;
      let found = false;
      db.schedules = db.schedules.map(s => {
        if (s.id == input.id) { found = true; return { ...s, ...input }; }
        return s;
      });
      if (!found) { input.id = Date.now(); db.schedules.push(input); }
      saveS(db);
      return res.json({ status: 'success', data: input });
    }
    if (req.method === 'DELETE') {
      db.schedules = db.schedules.filter(s => s.id != id);
      saveS(db);
      return res.json({ status: 'success' });
    }
  }

  if (action === 'valve') {
    if (req.method === 'POST') { 
      db.valve_open = !!req.body.open; 
      saveS(db); 
      const cmd = db.valve_open ? 'ON' : 'OFF';
      if (port && port.isOpen) port.write(`${cmd}\n`);
      return res.json({ status: 'success' }); 
    }
    return res.json({ valve_open: db.valve_open });
  }

  if (action === 'weather') {
    return res.json({
      current: { temp: 28.5, humidity: 55, condition: 'Clear Sky' },
      forecast: [
        { day: 'Tomorrow', temp: 29, condition: 'Sunny' },
        { day: 'Sunday', temp: 27, condition: 'Showers' }
      ]
    });
  }

  if (action === 'recommendation') {
    const m = parseInt(moisture || '50');
    const t = parseInt(temp || '25');
    const crops = [
      { name: 'Coffee (Arabica)', minMoisture: 60, maxMoisture: 80, minTemp: 18, maxTemp: 24, icon: '☕', type: 'Cash Crop' },
      { name: 'Teff', minMoisture: 30, maxMoisture: 50, minTemp: 15, maxTemp: 27, icon: '🌾', type: 'Grain' },
      { name: 'Basmati Rice', minMoisture: 75, maxMoisture: 100, minTemp: 22, maxTemp: 35, icon: '🍚', type: 'Grain' },
      { name: 'Sweet Maize', minMoisture: 55, maxMoisture: 75, minTemp: 18, maxTemp: 32, icon: '🌽', type: 'Grain' },
      { name: 'Potatoes', minMoisture: 70, maxMoisture: 85, minTemp: 15, maxTemp: 20, icon: '🥔', type: 'Vegetable' },
      { name: 'Desert Sorghum', minMoisture: 15, maxMoisture: 40, minTemp: 26, maxTemp: 45, icon: '🍂', type: 'Hardy' },
      { name: 'Avocado', minMoisture: 50, maxMoisture: 70, minTemp: 20, maxTemp: 30, icon: '🥑', type: 'Fruit' },
      { name: 'Mango', minMoisture: 40, maxMoisture: 60, minTemp: 24, maxTemp: 35, icon: '🥭', type: 'Fruit' },
      { name: 'Red Onions', minMoisture: 60, maxMoisture: 75, minTemp: 13, maxTemp: 24, icon: '🧅', type: 'Vegetable' },
      { name: 'Chickpeas', minMoisture: 25, maxMoisture: 45, minTemp: 18, maxTemp: 26, icon: '🌱', type: 'Legume' },
      { name: 'Bananas', minMoisture: 80, maxMoisture: 100, minTemp: 26, maxTemp: 32, icon: '🍌', type: 'Fruit' },
      { name: 'Garlic', minMoisture: 50, maxMoisture: 70, minTemp: 10, maxTemp: 24, icon: '🧄', type: 'Vegetable' },
      { name: 'Barley', minMoisture: 40, maxMoisture: 60, minTemp: 12, maxTemp: 25, icon: '🍺', type: 'Grain' }
    ];

    const recommended = crops.map(c => {
      const midM = (c.minMoisture + c.maxMoisture) / 2;
      const midT = (c.minTemp + c.maxTemp) / 2;
      const mDiff = Math.abs(m - midM);
      const tDiff = Math.abs(t - midT);
      let score = 100 - (mDiff * 1.5 + tDiff * 2);
      return { ...c, score: Math.round(Math.max(0, score)) };
    }).sort((a, b) => b.score - a.score);

    return res.json({ recommendations: recommended });
  }

  res.json({ status: 'online' });
});

// --- Professional Scheduler (Time + Day Matching) ---
setInterval(() => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue" etc.
  
  const db = getS();
  db.schedules.forEach(sched => {
    // Exact time match?
    if (sched.active && sched.time === timeStr) {
      // Day match? (Daily or current day is in the string)
      if (sched.days === 'Daily' || sched.days.includes(dayName)) {
        console.log(`🚀 [SCHEDULER] Triggered ${sched.time} irrigation on ${dayName}`);
        if (port && port.isOpen) {
          port.write("ON\n");
          const mins = parseInt(sched.duration) || 5;
          setTimeout(() => {
            console.log(`🛑 [SCHEDULER] Duration finished. Turning pump OFF.`);
            if (port && port.isOpen) port.write("OFF\n");
          }, mins * 60000);
        }
      }
    }
  });
}, 60000);

server.listen(PORT, () => console.log(`\n🚀 ERSHAYE SMARF FARMING BACKEND: http://localhost:${PORT}`));
