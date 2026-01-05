import { ShieldCheck, Truck, CreditCard, Facebook, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 py-12 pb-32 md:pb-12 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
        
        {/* Columna 1: Marca y Promesa */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">LV PARTS</h3>
          <p className="text-gray-500 leading-relaxed">
            Especialistas en repuestos de motocicletas. Calidad garantizada y envíos seguros a todo el país.
          </p>
          <div className="flex gap-4 pt-2">
            <Facebook className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Columna 2: Enlaces de Confianza (Placeholders) */}
        <div className="space-y-4">
          <h4 className="text-white font-bold">Atención al Cliente</h4>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer transition-colors">Rastrea tu pedido</li>
            <li className="hover:text-white cursor-pointer transition-colors">Política de Devoluciones</li>
            <li className="hover:text-white cursor-pointer transition-colors">Términos y Condiciones</li>
            <li className="hover:text-white cursor-pointer transition-colors">Preguntas Frecuentes</li>
          </ul>
        </div>

        {/* Columna 3: Seguridad */}
        <div className="space-y-4">
          <h4 className="text-white font-bold">Compra Segura</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Garantía en todos los productos</span>
            </li>
            <li className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Envíos asegurados</span>
            </li>
            <li className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Pago contra entrega o Transferencia</span>
            </li>
          </ul>
        </div>

        {/* Columna 4: Contacto Rápido */}
        <div className="space-y-4">
          <h4 className="text-white font-bold">Contacto</h4>
          <p>Lunes a Sábado: 9:00 AM - 6:00 PM</p>
          <p className="text-gray-500">Pedidos WhatsApp: +593 99 327 9707</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800 text-center text-xs text-gray-600 flex flex-col md:flex-row justify-between items-center gap-2">
        <p>&copy; {new Date().getFullYear()} LV PARTS. Todos los derechos reservados.</p>
        <p>Desarrollado con seguridad SSL</p>
      </div>
    </footer>
  );
};