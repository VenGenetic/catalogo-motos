import { useState, useMemo } from 'react';
import { Search, Wrench, AlertCircle } from 'lucide-react';
import { MODELOS } from '../config/constants';
import { getMotoImage } from '../config/motoImages';
import { Producto } from '../types';

interface Props {
  onSelectModel: (modelo: string) => void;
  onSearchGlobal: (termino: string) => void;
  productos?: Producto[];
}

export const MotoSelector = ({ onSelectModel, onSearchGlobal, productos = [] }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partSearch, setPartSearch] = useState(''); 

  const stockPorModelo = useMemo(() => {
    if (!productos || productos.length === 0) return {};
    return MODELOS.reduce((acc, modelo) => {
        const key = modelo.split(' ')[0].toLowerCase(); // Ej: "tekken"
        const count = productos.filter(p => p.nombre.toLowerCase().includes(key)).length;
        acc[modelo] = count;
        return acc;
    }, {} as Record<string, number>);
  }, [productos]);

  const modelosFiltrados = MODELOS.filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 px-4">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">¿Qué necesitas hoy?</h1>
        <p className="text-gray-500 mb-8 text-lg">Busca tu repuesto directo o selecciona tu moto</p>
        
        {/* Buscador Global */}
        <div className="max-w-xl mx-auto space-y-4 mb-10">
           <div className="relative group z-20">
            <input type="text" placeholder="Ej. Batería, Pistón, Espejo..." className="w-full pl-12 pr-20 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 outline-none transition-all shadow-sm"
              value={partSearch} onChange={(e) => setPartSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && partSearch.trim() && onSearchGlobal(partSearch)}
            />
            <Wrench className="absolute left-4 top-4.5 text-slate-400 w-6 h-6" />
            <button onClick={() => partSearch.trim() && onSearchGlobal(partSearch)} className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-4 rounded-lg font-bold text-sm">Buscar</button>
          </div>
          <div className="flex items-center justify-center gap-4 text-gray-300 font-bold text-sm"><div className="h-px bg-gray-200 flex-1"></div>O ELIGE TU MOTO<div className="h-px bg-gray-200 flex-1"></div></div>
          <div className="relative group z-10">
            <input type="text" placeholder="Filtrar modelos..." className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-600 outline-none transition-all shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4.5 text-gray-400 w-6 h-6" />
          </div>
        </div>

        {/* Grilla */}
        {modelosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {modelosFiltrados.map((modelo) => {
              const stock = stockPorModelo[modelo] ?? 0;
              const hasStock = stock > 0;
              return (
                <button key={modelo} disabled={!hasStock} onClick={() => onSelectModel(modelo.split(' ')[0])}
                  className={`group relative flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden text-left transition-all duration-300 
                    ${hasStock ? 'hover:shadow-xl hover:border-red-200 hover:-translate-y-1 border-gray-100 cursor-pointer' : 'opacity-60 grayscale border-gray-100 cursor-not-allowed'}`}>
                  <div className="w-full h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center p-2">
                    <img src={getMotoImage(modelo)} alt={modelo} loading="lazy" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    {!hasStock && <div className="absolute inset-0 bg-white/40 flex items-center justify-center"><span className="bg-gray-800 text-white text-xs px-2 py-1 rounded font-bold">Sin Stock</span></div>}
                  </div>
                  <div className="p-4 border-t border-gray-50">
                    <h3 className={`font-bold text-sm leading-tight ${hasStock ? 'text-slate-800' : 'text-gray-500'}`}>{modelo}</h3>
                    <div className="mt-2">
                        {hasStock ? 
                             <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stock} repuestos</span> : 
                             <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><AlertCircle size={10} /> Agotado</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 py-10">No encontramos ese modelo...</p>
        )}
      </div>
    </div>
  );
};