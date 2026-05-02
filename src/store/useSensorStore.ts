import { create } from 'zustand';

export interface SensorData {
  soilMoisturePlant: number; // 0-100%
  soilMoistureTank: number; // 0-100%, near 0 means empty
  temperature: number; // Celsius
  humidity: number; // 0-100%
  valveOpen: boolean;
  timestamp: string;
}

export interface HardwareAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface HardwareLog {
  id: string;
  action: string;
  timestamp: string;
}

interface ApplicationState {
  // Live Data
  currentData: SensorData;
  historyData: SensorData[];
  
  // Settings
  settings: {
    soilMoistureMin: number;
    soilMoistureMax: number;
    temperatureHigh: number;
    isAutoMode: boolean;
    pulseMode: boolean;
  };
  
  // Alerts and Logs
  alerts: HardwareAlert[];
  logs: HardwareLog[];
  
  // UI State
  sidebarOpen: boolean;
  
  // Actions
  updateSensorData: (data: Partial<SensorData>) => void;
  toggleValve: () => void;
  setValveOpen: (isOpen: boolean) => void;
  updateSettings: (settings: Partial<ApplicationState['settings']>) => void;
  addAlert: (alert: Omit<HardwareAlert, 'id' | 'read' | 'timestamp'>) => void;
  markAlertRead: (id: string) => void;
  addLog: (action: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

const initialData: SensorData = {
  soilMoisturePlant: 45,
  soilMoistureTank: 85,
  temperature: 24.5,
  humidity: 55,
  valveOpen: false,
  timestamp: new Date().toISOString(),
};

export const useSensorStore = create<ApplicationState>((set, get) => ({
  currentData: initialData,
  historyData: Array.from({ length: 20 }, (_, i) => ({
    ...initialData,
    soilMoisturePlant: 30 + Math.random() * 30,
    temperature: 20 + Math.random() * 10,
    humidity: 40 + Math.random() * 30,
    timestamp: new Date(Date.now() - (20 - i) * 60000 * 30).toISOString(), // Past data
  })),
  
  settings: {
    soilMoistureMin: 30,
    soilMoistureMax: 70,
    temperatureHigh: 35,
    isAutoMode: false,
    pulseMode: false,
  },
  
  alerts: [
    { id: '1', type: 'warning', message: 'Soil moisture dropping below optimal levels.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false }
  ],
  logs: [
    { id: '1', action: 'System Initialization', timestamp: new Date(Date.now() - 86400000).toISOString() }
  ],
  sidebarOpen: false,
  
  updateSensorData: (data) => set((state) => {
    const newData = { ...state.currentData, ...data, timestamp: new Date().toISOString() };
    const newHistory = [...state.historyData, newData].slice(-50); // Keep last 50
    return { currentData: newData, historyData: newHistory };
  }),
  
  toggleValve: () => set((state) => {
    const newVal = !state.currentData.valveOpen;
    // We don't set the logic here, we'll let SocketManager handle the emission
    return { currentData: { ...state.currentData, valveOpen: newVal, timestamp: new Date().toISOString() } };
  }),

  setValveOpen: (isOpen: boolean) => set((state) => ({
    currentData: { ...state.currentData, valveOpen: isOpen, timestamp: new Date().toISOString() }
  })),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  addAlert: (alert) => set((state) => ({
    alerts: [{ ...alert, id: Math.random().toString(36).slice(2), timestamp: new Date().toISOString(), read: false }, ...state.alerts]
  })),
  
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
  })),
  
  addLog: (action) => set((state) => ({
    logs: [{ id: Math.random().toString(36).slice(2), action, timestamp: new Date().toISOString() }, ...state.logs]
  })),
  
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen })
}));
