import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definimos la forma de una Moto (ajusta según necesites)
export interface Moto {
  id: string;
  name: string;
  image?: string;
}

interface GarageContextType {
  selectedMoto: Moto | null;
  selectMoto: (moto: Moto | null) => void;
  myGarage: Moto[];
  addToGarage: (moto: Moto) => void;
  removeFromGarage: (motoId: string) => void;
}

const GarageContext = createContext<GarageContextType | undefined>(undefined);

export const GarageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMoto, setSelectedMoto] = useState<Moto | null>(null);
  const [myGarage, setMyGarage] = useState<Moto[]>([]);

  const addToGarage = (moto: Moto) => {
    if (!myGarage.find(m => m.id === moto.id)) {
      setMyGarage([...myGarage, moto]);
    }
  };

  const removeFromGarage = (motoId: string) => {
    setMyGarage(myGarage.filter(m => m.id !== motoId));
    if (selectedMoto?.id === motoId) {
      setSelectedMoto(null);
    }
  };

  const selectMoto = (moto: Moto | null) => {
    setSelectedMoto(moto);
  };

  return (
    <GarageContext.Provider 
      value={{ selectedMoto, selectMoto, myGarage, addToGarage, removeFromGarage }}
    >
      {children}
    </GarageContext.Provider>
  );
};

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (context === undefined) {
    throw new Error('useGarage debe ser usado dentro de un GarageProvider');
  }
  return context;
};