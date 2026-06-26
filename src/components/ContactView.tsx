import { Phone, Users, Clock, MapPin } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

const ContactView = () => (
  <div className="min-h-screen bg-gray-50 pb-24 pt-8 px-4 font-sans">
    <div className="max-w-md mx-auto space-y-6">
      
      {/* Tarjeta Principal */}
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Phone className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Hablemos por WhatsApp</h2>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Nuestros asesores técnicos están listos para confirmar stock y ayudarte con tu pedido.
        </p>
        
        <a 
          href={`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 transition-all mb-4 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Phone className="w-5 h-5 fill-current" />
          Iniciar Chat con Asesor
        </a>

        <p className="text-xs text-gray-400">
          Tiempo de respuesta promedio: menos de 5 min
        </p>
      </div>

      {/* Tarjeta de Información Adicional */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Atención Experta</h3>
            <p className="text-xs text-gray-500">Te ayudamos a encontrar la pieza exacta</p>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="bg-orange-50 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Horario de Atención</h3>
            <p className="text-xs text-gray-500">Lun - Sáb: 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="bg-green-50 p-2 rounded-lg">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Teléfono / WhatsApp</h3>
            <p className="text-xs text-gray-500 font-mono font-bold">+593 99 327 9707</p>
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="bg-purple-50 p-2 rounded-lg">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Envíos Nacionales</h3>
            <p className="text-xs text-gray-500">Cobertura a todo el Ecuador</p>
          </div>
        </div>

        <a 
          href="https://maps.app.goo.gl/6L6JP7QC51UqXJPf7" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
        >
          <div className="bg-red-50 p-2 rounded-lg shrink-0">
            <MapPin className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-slate-800 text-sm">Nuestra Ubicación</h3>
            <p className="text-xs text-blue-600 font-bold hover:underline">Ver en Google Maps</p>
          </div>
        </a>
      </div>

    </div>
  </div>
);

// IMPORTANTE: Usamos export default para que funcione correctamente con lazy() en App.tsx
export default ContactView;