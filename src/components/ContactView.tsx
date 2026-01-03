import { Phone } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

export const ContactView = () => (
  <div className="min-h-screen bg-gray-50 pb-24 pt-8 px-4">
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
        className="block w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all mb-4"
      >
        Chat en WhatsApp
      </a>
      <p className="text-xs text-gray-400">Horario: Lunes a Sábado, 9am - 6pm</p>
    </div>
  </div>
);