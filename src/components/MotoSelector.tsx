import { useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import { MODELOS } from '../config/constants';
import { getMotoImage } from '../config/motoImages';

interface Props {
  onSelectModel: (modelo: string) => void;
  onSearchGlobal: (termino: string) => void;
}

export const MotoSelector = ({ onSelectModel, onSearchGlobal }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partSearch, setPartSearch] = useState(''); 

  const modelosFiltrados = MODELOS.filter(m => 
    m.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && partSearch.trim()) {
      onSearchGlobal(partSearch);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-12 md:pt-16 pb-8 md:pb-12 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado - MÁS COMPACTO EN MÓVIL */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 md:mb-3">
            ¿Qué necesitas hoy?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4 md:mb-8 text-sm md:text-lg px-2">
            Busca tu repuesto directo o selecciona tu moto
          </p>
          
          <div className="max-w-xl mx-auto space-y-3 md:space-y-4">
            
            {/* 1. PRIMERO: BUSCADOR DE REPUESTOS (Ahora arriba) */}
            <div className="relative group z-20">
              <input
                type="text"
                placeholder="Busca un repuesto (ej. Bujía)..."
                className="w-full pl-10 md:pl-12 pr-16 md:pr-20 py-3 md:py-4 rounded-lg md:rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-800 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-900 dark:text-white outline-none transition-all text-sm md:text-lg shadow-sm"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
                autoFocus // Le damos foco automático a este input
              />
              <Wrench className="absolute left-4 top-4.5 text-slate-400 dark:text-slate-500 w-6 h-6" />
              <button 
                onClick={() => partSearch.trim() && onSearchGlobal(partSearch)}
                className="absolute right-2 top-2 bottom-2 bg-slate-900 dark:bg-red-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-red-700 transition-colors"
              >
                Buscar
              </button>
            </div>

            {/* DIVISOR */}
            <div className="flex items-center justify-center gap-4 text-gray-300 dark:text-gray-600 font-bold text-sm">
              <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1"></div>
              O ELIGE TU MOTO
              <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1"></div>
            </div>

            {/* 2. SEGUNDO: BUSCADOR DE MOTOS (Ahora abajo) */}
            <div className="relative group z-10">
              <input
                type="text"
                placeholder="Filtra por modelo (ej. Tekken)..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:border-red-600 focus:ring-4 focus:ring-red-100 outline-none transition-all text-lg shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-4.5 text-gray-400 dark:text-gray-500 w-6 h-6" />
            </div>

          </div>
        </div>

        {/* Grilla de Imágenes */}
        {modelosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {modelosFiltrados.map((modelo) => (
              <button
                key={modelo}
                onClick={() => {
                  const primeraPalabra = modelo.split(' ')[0];
                  onSelectModel(primeraPalabra);
                }}
                className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden text-left hover:-translate-y-1"
              >
                <div className="w-full h-40 md:h-48 bg-gray-100 dark:bg-slate-700 relative overflow-hidden flex items-center justify-center p-2">
                  <img 
                    src={getMotoImage(modelo)} 
                    alt={modelo}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.classList.add('bg-slate-200', 'dark:bg-slate-700');
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/5 dark:bg-white/10 text-black/40 dark:text-white/60 text-[10px] px-2 py-1 rounded-full font-bold group-hover:bg-red-600 group-hover:text-white transition-colors">
                    VER
                  </div>
                </div>
                <div className="p-4 border-t border-gray-50 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm md:text-base leading-tight group-hover:text-red-600 transition-colors">
                    {modelo}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No encontramos ese modelo...</p>
          </div>
        )}

      </div>
    </div>
  );
};