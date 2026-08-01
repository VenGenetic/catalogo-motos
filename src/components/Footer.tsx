import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#010f1f] dark:bg-brand-bg border-t border-gray-150 dark:border-brand-border text-gray-500 dark:text-gray-400 font-sans pb-32 md:pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Lado izquierdo: Marca, Redes y Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-4 mb-3">
            <div className="font-anton text-2xl tracking-widest text-slate-800 dark:text-white uppercase">
              LV <span className="text-brand-orange">PARTS</span>
            </div>
            
            {/* Redes Sociales */}
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61583611217559" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Facebook"
                className="text-gray-400 hover:text-brand-orange transition-colors"
              >
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a 
                href="https://www.instagram.com/love_daytona_oficial/" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Instagram"
                className="text-gray-400 hover:text-brand-orange transition-colors"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>
          
          <p className="font-geist text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} LV PARTS - REPUESTOS ORIGINALES DAYTONA. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>

        {/* Lado derecho: Enlaces */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 font-geist text-[10px] font-bold uppercase tracking-widest">
          <Link 
            to="/contacto" 
            className="text-slate-500 dark:text-gray-400 hover:text-brand-orange transition-colors"
          >
            Soporte
          </Link>
          <Link
            to="/catalogo"
            className="text-slate-500 dark:text-gray-400 hover:text-brand-orange transition-colors"
          >
            Distribuidores
          </Link>
        </div>

      </div>
    </footer>
  );
};