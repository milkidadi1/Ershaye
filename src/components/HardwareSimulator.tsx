"use client";

import { useEffect } from "react";
import { useSensorStore } from "@/store/useSensorStore";

export default function HardwareSimulator() {
  const { currentData, settings, updateSensorData, toggleValve } = useSensorStore();

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight fluctuations in sensor data
      const newMoisture = Math.max(0, Math.min(100, currentData.soilMoisturePlant + (Math.random() - 0.5) * 5));
      const newTemp = Math.max(0, currentData.temperature + (Math.random() - 0.5) * 1);
      const newHumidity = Math.max(0, Math.min(100, currentData.humidity + (Math.random() - 0.5) * 3));
      
      updateSensorData({
        soilMoisturePlant: newMoisture,
        temperature: newTemp,
        humidity: newHumidity,
      });
      
      // Auto-mode logic simulation
      if (settings.isAutoMode) {
        if (newMoisture < settings.soilMoistureMin && !currentData.valveOpen && currentData.soilMoistureTank > 10) {
          toggleValve(); // open
        } else if (newMoisture > settings.soilMoistureMax && currentData.valveOpen) {
          toggleValve(); // close
        }
      }
      
      // Safety override: if tank empty, force close
      if (currentData.soilMoistureTank <= 10 && currentData.valveOpen) {
        // We'd actually mutate directly or call a specific close function, but toggle works here if it's open
        toggleValve();
      }

    }, 5000); // 5 sec interval

    return () => clearInterval(interval);
  }, [currentData, settings, updateSensorData, toggleValve]);

  return null;
}
