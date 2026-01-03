import { Phone } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

// NOTA IMPORTANTE: Usamos 'export const' (no 'export default') para que coincida con App.tsx
export const ContactView = () => (
  <div className="min-h-screen bg-gray-50 pb-24 pt-8 px-4 font-sans">
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Contáctanos</h2>
      <p className="text-gray-500 mb-8 text-sm">Estamos listos para ayudarte por WhatsApp.</p>
      
      <a 
        href={`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all mb-4 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Phone className="w-5 h-5 fill-current" />
        Chat en WhatsApp
      </a>
      
      <div className="border-t border-gray-100 pt-4 mt-6">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Horario de Atención</p>
        <p className="text-sm text-slate-700">Lunes a Sábado, 9:00 AM - 6:00 PM</p>
      </div>
    </div>
  </div>
);