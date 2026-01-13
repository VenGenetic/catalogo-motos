// src/context/GarageContext.tsx
import { createContext, useState, useContext, ReactNode } from 'react';

export interface SelectedVehicle {
  year?: number;
  make: string;
  model: string;
}

interface GarageContextType {
  vehicle: SelectedVehicle | null;
  setVehicle: (vehicle: SelectedVehicle | null) => void;
  clearGarage: () => void;
}

const GarageContext = createContext<GarageContextType | undefined>(undefined);

export const GarageProvider = ({ children }: { children: ReactNode }) => {
  const [vehicle, setVehicleState] = useState<SelectedVehicle | null>(() => {
    try {
      const saved = localStorage.getItem('LV_PARTS_GARAGE');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setVehicle = (v: SelectedVehicle | null) => {
    setVehicleState(v);
    if (v) {
      localStorage.setItem('LV_PARTS_GARAGE', JSON.stringify(v));
    } else {
      localStorage.removeItem('LV_PARTS_GARAGE');
    }
  };

  const clearGarage = () => setVehicle(null);

  return (
    <GarageContext.Provider value={{ vehicle, setVehicle, clearGarage }}>
      {children}
    </GarageContext.Provider>
  );
};

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (!context) throw new Error('useGarage debe usarse dentro de GarageProvider');
  return context;
};