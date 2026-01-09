// src/components/VehicleSelector.tsx
import { useState } from 'react';
import { useGarage } from '../context/GarageContext';

// Base de datos de motos (Aquí puedes agregar más modelos en el futuro)
const BIKE_DB = {
  years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018],
  makes: ['Daytona', 'Yamaha', 'Honda', 'Suzuki', 'IGM', 'Shineray'],
  models: {
    'Daytona': [
      'Workforce Anniversary 150CC', // Nombre corregido
      'Tekken 250',
      'Tekken 223',
      'Scrambler 250',
      'Evo 180',
      'Wolf 200',
      'DY 150',
      'Explorer 150'
    ],
    'Yamaha': ['MT-09', 'MT-07', 'MT-03', 'R15', 'FZ 25', 'XTZ 125'],
    'Honda': ['XR 190', 'XR 150', 'Tornado 250', 'CB 190R', 'Navi'],
    'Suzuki': ['Gixxer 150', 'Gixxer 250', 'DR 150', 'GN 125'],
    'IGM': ['Caffe Racer', 'Goat'],
    'Shineray': ['XY 150', 'Jefe']
  }
};

export default function VehicleSelector() {
  const { vehicle, setVehicle } = useGarage();
  const [year, setYear] = useState<string>('');
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');

  const handleSetVehicle = () => {
    if (year && make && model) {
      setVehicle({ year: parseInt(year), make, model });
    }
  };

  const clearVehicle = () => {
    setVehicle(null);
    setYear('');
    setMake('');
    setModel('');
  };

  // VISTA 1: Si el usuario YA seleccionó una moto
  if (vehicle) {
    return (
      <div className="bg-emerald-600 text-white p-4 rounded-lg mb-6 flex justify-between items-center shadow-lg animate-fade-in-down">
        <div>
          <span className="text-xs uppercase tracking-wider opacity-80 font-semibold">
            Mi Moto Actual
          </span>
          <div className="font-bold text-lg flex items-center gap-2">
            🏍️ {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
        </div>
        <button 
          onClick={clearVehicle}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm transition font-medium backdrop-blur-sm"
        >
          Cambiar Moto
        </button>
      </div>
    );
  }

  // VISTA 2: Si NO ha seleccionado moto (Buscador)
  return (
    <div className="bg-slate-800 p-6 rounded-lg mb-6 shadow-xl border border-slate-700 text-white">
      <h2 className="font-bold mb-4 flex items-center gap-2 text-xl">
        <span className="text-red-500">🛠️</span> Encuentra piezas exactas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Selector de AÑO */}
        <div className="relative">
          <select 
            className="w-full bg-slate-900 border border-slate-600 p-3 rounded appearance-none focus:border-red-500 focus:outline-none transition cursor-pointer"
            value={year} 
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Año</option>
            {BIKE_DB.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        {/* Selector de MARCA */}
        <div className="relative">
          <select 
            className="w-full bg-slate-900 border border-slate-600 p-3 rounded appearance-none focus:border-red-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            value={make} 
            onChange={(e) => {
              setMake(e.target.value);
              setModel(''); // Reiniciar modelo si cambia la marca
            }} 
            disabled={!year}
          >
            <option value="">Marca</option>
            {BIKE_DB.makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Selector de MODELO */}
        <div className="relative">
          <select 
            className="w-full bg-slate-900 border border-slate-600 p-3 rounded appearance-none focus:border-red-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            value={model} 
            onChange={(e) => setModel(e.target.value)} 
            disabled={!make}
          >
            <option value="">Modelo</option>
            {make && BIKE_DB.models[make as keyof typeof BIKE_DB.models]?.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Botón CONFIRMAR */}
        <button 
          onClick={handleSetVehicle} 
          disabled={!model} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2"
        >
          CONFIRMAR
        </button>
      </div>
    </div>
  );
}