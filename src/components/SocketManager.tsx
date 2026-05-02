"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSensorStore } from '@/store/useSensorStore';

const BACKEND_URL = 'http://localhost:5000';

export default function SocketManager() {
  const socketRef = useRef<Socket | null>(null);
  const { 
    updateSensorData, 
    settings, 
    currentData, 
    setValveOpen,
    addLog,
    addAlert
  } = useSensorStore();

  const isAutoMode = settings.isAutoMode;
  const valveOpen = currentData.valveOpen;
  const soil = currentData.soilMoisturePlant;
  const tank = currentData.soilMoistureTank;
  const threshold = settings.soilMoistureMin;

  // Initialize Socket
  useEffect(() => {
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Arduino Backend');
      addLog('Connected to Hardware Server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Arduino Backend');
      addLog('Hardware Server Offline');
    });

    socket.on('sensorData', (data: any) => {
      // Map backend data to store
      // Backend format: { soil, tank, temp, humidity }
      updateSensorData({
        soilMoisturePlant: data.soil,
        soilMoistureTank: data.tank,
        temperature: data.temp,
        humidity: data.humidity
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [updateSensorData, addLog]);

  // Handle Outbound Commands (Manual Toggle)
  // We use a ref to track the last sent command to avoid loops
  const lastSentCommand = useRef<string | null>(null);

  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      const command = valveOpen ? 'ON' : 'OFF';
      
      // Only send if it's different from what we last sent
      if (lastSentCommand.current !== command) {
        socketRef.current.emit('relay', command);
        lastSentCommand.current = command;
        console.log(`Sent relay command: ${command}`);
      }
    }
  }, [valveOpen]);

  // Auto Mode Logic
  useEffect(() => {
    if (isAutoMode) {
      const shouldBeOpen = soil < threshold && tank > 10;
      
      if (shouldBeOpen && !valveOpen) {
        setValveOpen(true);
        addLog('Auto-Irrigation: Soil dry, pump started.');
      } else if (!shouldBeOpen && valveOpen) {
        setValveOpen(false);
        addLog('Auto-Irrigation: Conditions met, pump stopped.');
        
        if (tank <= 10 && soil < threshold) {
          addAlert({
            type: 'critical',
            message: 'Auto-Irrigation Failed: Tank empty!'
          });
        }
      }
    }
  }, [isAutoMode, soil, tank, threshold, valveOpen, setValveOpen, addLog, addAlert]);

  return null; // This component handles side effects only
}
