interface HeroSectionProps {
  onExplore: () => void;
}

export const HeroSection = ({ onExplore }: HeroSectionProps) => {
  return (
    <div className="relative pt-16 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center relative z-10">
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Repuestos <span className="text-red-600">Originales</span> para tu Daytona
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg">
            Mantén tu moto como nueva con piezas de alta calidad. Envíos seguros a todo el Ecuador.
          </p>
          <button 
            onClick={onExplore}
            className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            Explorar Catálogo
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="/hero-nueva.png" 
            alt="Moto Daytona" 
            className="w-full max-w-lg drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};