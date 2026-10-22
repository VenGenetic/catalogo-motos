// src/components/CartDrawer.tsx
import { useState } from 'react';
import { X, Minus, Plus, MessageCircle, User, ArrowRight, Check, FileText, Trash2, MapPin, Truck, Eye, ShoppingCart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { optimizarImg } from '../utils/helpers';
import { LazyImage } from './LazyImage';
import { trackInitiateCheckout } from '../utils/tracking';
import { APP_CONFIG } from '../config/constants';
import { buildWhatsAppUrl } from '../utils/attribution';
import { registrarSolicitud } from '../utils/solicitudes';

/*
  El pedido: un panel que entra por la derecha (en el celular, a pantalla
  completa). Arriba la lista de repuestos, abajo fijos el total, "Copiar" la
  proforma y "Pedir" por WhatsApp. Usa los mismos colores y botones que el
  resto del sitio (tokens ui-* y brand-*), en claro y en oscuro.

  Los dos botones dejan el pedido registrado en el ERP (utils/solicitudes.ts)
  y escriben su número en el mensaje, para que el vendedor lo encuentre.
*/

const campo = 'w-full rounded-xl border border-ui-border bg-ui-muted px-4 py-3.5 text-base text-ui-ink outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-ui-copy focus:border-brand-orange focus:bg-ui-surface focus:ring-4 focus:ring-brand-orange/15';

export const CartDrawer = () => {
  const {
    isOpen,
    closeCart,
    cart,
    updateQuantity,
    cartTotal
  } = useCart();

  const [, setSearchParams] = useSearchParams();

  const handleOpenProduct = (id: string) => {
    setSearchParams((prev) => { prev.set('prod', id); return prev; });
    closeCart(); // Cerramos el carrito para permitir ver el modal cómodamente
  };

  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    // El valor de la primera opción del selector: con 'Transferencia' a secas
    // el mensaje decía un pago que no estaba en la lista.
    metodoPago: 'Transferencia Bancaria'
  });

  const [copied, setCopied] = useState(false);

  // Estado para el modal de envío
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [hasShipping, setHasShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState('');
  const tienePreciosPendientes = cart.some(item => !(Number(item.precio) > 0));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- LÓGICA DE MENSAJES ---
  const generarMensajeWhatsApp = (costoEnvio: number, codigo: string) => {
    const itemsList = cart.map(item => {
      const ref = item.codigo_referencia ? ` (Ref: ${item.codigo_referencia})` : '';
      return `▪️ *${item.cantidad}x* ${item.nombre}${ref} (${Number(item.precio) > 0 ? `$${(item.cantidad * Number(item.precio)).toFixed(2)}` : 'precio por confirmar'})`;
    }).join('\n');

    const totalFinal = costoEnvio > 0 ? cartTotal + costoEnvio : cartTotal;

    return `👋 Hola LV PARTS, quiero confirmar el siguiente pedido (N.º ${codigo}):

${itemsList}
${costoEnvio > 0 ? `▪️ *Envío / Transporte:* $${costoEnvio.toFixed(2)}` : ''}

💰 *${tienePreciosPendientes ? 'SUBTOTAL CON PRECIOS DISPONIBLES' : 'TOTAL DE PIEZAS'}: $${totalFinal.toFixed(2)}*
${tienePreciosPendientes ? 'Hay piezas con precio por confirmar. Por favor, envíenme la cotización final.\n' : ''}

📋 *Datos de Envío:*
👤 Nombre: ${formData.nombre.trim() || 'No especificado'}
📍 Ciudad/Dirección: ${formData.ciudad.trim() || 'No especificado'}
💳 Pago: ${formData.metodoPago}

¿Me confirman disponibilidad y valor final?`;
  };

  const generarTextoProforma = (costoEnvio: number, codigo: string) => {
    const date = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
    const itemsList = cart.map(item => {
      const ref = item.codigo_referencia ? ` (Ref: ${item.codigo_referencia})` : '';
      return `Cant: ${item.cantidad} | ${item.nombre}${ref} | ${Number(item.precio) > 0 ? `$${(item.cantidad * Number(item.precio)).toFixed(2)}` : 'Precio por confirmar'}`;
    }).join('\n');

    const totalFinal = costoEnvio > 0 ? cartTotal + costoEnvio : cartTotal;

    return `📄 *COTIZACIÓN / PROFORMA - LV PARTS*
🧾 N.º ${codigo}
📅 Fecha: ${date}
👤 Cliente: ${formData.nombre.trim() || 'Consumidor Final'}
📍 Destino: ${formData.ciudad.trim() || 'Pendiente'}

*DETALLE DEL PEDIDO:*
--------------------------------
${itemsList}
--------------------------------
SUBTOTAL: $${cartTotal.toFixed(2)}
${costoEnvio > 0 ? `ENVÍO:    $${costoEnvio.toFixed(2)}` : ''}
*${tienePreciosPendientes ? 'TOTAL PARCIAL' : 'TOTAL'}:    $${totalFinal.toFixed(2)}*
${tienePreciosPendientes ? 'Piezas pendientes de cotización incluidas en el pedido.' : ''}

💳 Método Sugerido: ${formData.metodoPago}
⚠️ *Precios sujetos a disponibilidad.*`;
  };

  const handleCheckout = () => {
    trackInitiateCheckout(cart, cartTotal);
    // Sin envío por defecto. Sin await: WhatsApp se abre en este mismo toque
    // (si no, el navegador bloquea la ventana) y no depende de que se guarde.
    const codigo = registrarSolicitud('whatsapp', cart, formData, 0);
    const mensaje = generarMensajeWhatsApp(0, codigo);
    const url = buildWhatsAppUrl(APP_CONFIG.WHATSAPP_NUMBER, mensaje);
    window.open(url, '_blank');
  };

  const handleCopyClick = () => {
    setIsShippingModalOpen(true);
    setHasShipping(false);
    setShippingCost('');
  };

  const handleConfirmCopy = async () => {
    const finalShippingCost = hasShipping ? (parseFloat(shippingCost) || 0) : 0;
    const codigo = registrarSolicitud('proforma', cart, formData, finalShippingCost);
    const texto = generarTextoProforma(finalShippingCost, codigo);

    try {
      await navigator.clipboard.writeText(texto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsShippingModalOpen(false);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex justify-end">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-brand-bg/72 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Panel (ancho completo en el celular) */}
      <div className="relative flex h-[100dvh] w-full flex-col border-l border-ui-border bg-ui-surface shadow-2xl animate-slide-in-right md:max-w-[480px]">

        {/* --- CABECERA --- */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ui-border bg-ui-surface px-5 py-4">
          <h2 className="flex items-center gap-2 text-xl font-black text-ui-ink">
            Tu pedido
            <span className="rounded-full border border-ui-border bg-ui-muted px-2 py-0.5 text-xs font-bold tabular-nums text-ui-copy">
              {cart.length} {cart.length === 1 ? 'repuesto' : 'repuestos'}
            </span>
          </h2>
          <button
            onClick={closeCart}
            aria-label="Cerrar pedido"
            className="press -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ui-copy hover:bg-ui-muted hover:text-ui-ink"
          >
            <X className="h-7 w-7"/>
          </button>
        </div>

        {/* --- CONTENIDO --- */}
        <div className="flex-1 overflow-y-auto bg-ui-muted/45">
          {cart.length === 0 ? (
            <div className="flex h-[70%] flex-col items-center justify-center gap-6 p-8 text-center animate-rise">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-ui-border bg-ui-surface shadow-card">
                <ShoppingCart className="h-12 w-12 text-ui-copy/50" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-ui-ink">Tu pedido está vacío</p>
                <p className="text-sm text-ui-copy">Agrega repuestos del catálogo para armarlo.</p>
              </div>
              <button
                onClick={closeCart}
                className="press flex min-h-[48px] items-center justify-center rounded-xl bg-brand-bg px-8 font-bold text-white shadow-md hover:bg-brand-orange-action dark:bg-white dark:text-brand-bg dark:hover:bg-brand-orange dark:hover:text-white"
              >
                Volver al catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-6 p-4 pb-32">

              {/* LISTA DE REPUESTOS */}
              <div className="space-y-3">
                {cart.map((item, i) => {
                  const subtotal = (Number(item.precio) || 0) * (item.cantidad || item.cant || 0);
                  return (
                    <div key={item.id} className="stagger flex gap-4 rounded-2xl border border-ui-border bg-ui-surface p-3 shadow-card animate-rise" style={{ '--i': i } as React.CSSProperties}>
                      {/* Foto (abre la ficha) */}
                      <button
                        type="button"
                        className="group relative aspect-[1024/531] w-24 shrink-0 self-start overflow-hidden rounded-lg sm:w-28"
                        onClick={() => handleOpenProduct(item.id)}
                        aria-label={`Ver ${item.nombre}`}
                      >
                        {/* Apaisada como las fotos: se ve la pieza entera, no recortada. */}
                        <LazyImage
                          src={optimizarImg(item.imagen)}
                          fallbackSrc={`/imagenes_repuestos/${item.codigo_referencia}.webp`}
                          alt={item.nombre}
                          imageFit="contain"
                          className="h-full w-full rounded-lg border border-ui-border !bg-white"
                        />
                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-brand-bg/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                           <Eye className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden="true" />
                        </span>
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenProduct(item.id)}
                            className="line-clamp-2 text-left text-xs font-bold leading-tight text-ui-ink transition-colors hover:text-brand-orange-action dark:hover:text-brand-orange sm:text-sm"
                          >
                            {item.nombre}
                          </button>
                          <button
                             onClick={() => updateQuantity(item.id, -1000)} // Eliminar
                             aria-label={`Quitar ${item.nombre} del pedido`}
                             className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ui-copy transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-2 flex items-end justify-between">
                          <div className="font-black tabular-nums text-ui-ink">
                            ${subtotal.toFixed(2)}
                          </div>

                          {/* Cantidad */}
                          <div className="flex items-center gap-2 rounded-lg border border-ui-border bg-ui-muted p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label="Quitar una unidad"
                              className="press flex h-9 w-9 items-center justify-center rounded-md border border-ui-border bg-ui-surface text-ui-ink hover:bg-ui-raised"
                            >
                              <Minus size={16} strokeWidth={3}/>
                            </button>
                            <span key={item.cantidad} className="w-6 text-center text-sm font-black tabular-nums text-ui-ink animate-pop">
                              {item.cantidad || item.cant || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label="Agregar una unidad"
                              className="press flex h-9 w-9 items-center justify-center rounded-md bg-brand-bg text-white shadow-sm hover:bg-brand-orange-action dark:bg-white dark:text-brand-bg dark:hover:bg-brand-orange dark:hover:text-white"
                            >
                              <Plus size={16} strokeWidth={3}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DATOS DEL CLIENTE */}
              <div className="stagger space-y-4 rounded-2xl border border-ui-border bg-ui-surface p-5 shadow-card animate-rise" style={{ '--i': Math.min(cart.length, 6) } as React.CSSProperties}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-ui-ink">
                  <User size={16} className="text-brand-orange-action dark:text-brand-orange" aria-hidden="true" />
                  Datos para la nota (opcional)
                </h3>

                <label className="block">
                  <span className="sr-only">Tu nombre</span>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre o el del cliente"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={campo}
                  />
                </label>

                <label className="relative block">
                  <span className="sr-only">Ciudad o dirección</span>
                  <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-ui-copy" aria-hidden="true" />
                  <input
                    type="text"
                    name="ciudad"
                    placeholder="Ciudad / Dirección"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className={`${campo} pl-12`}
                  />
                </label>

                <label className="relative block">
                  <span className="sr-only">Forma de pago</span>
                  <select
                    name="metodoPago"
                    value={formData.metodoPago}
                    onChange={handleInputChange}
                    className={`${campo} appearance-none pr-10 font-semibold`}
                  >
                    <option value="Transferencia Bancaria">Transferencia bancaria</option>
                    <option value="Depósito">Depósito en agente</option>
                    <option value="Efectivo en Local">Efectivo en el local</option>
                  </select>
                  <ArrowRight size={18} className="pointer-events-none absolute right-4 top-4 rotate-90 text-ui-copy" aria-hidden="true" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* --- PIE FIJO --- */}
        <div className="z-20 mt-auto border-t border-ui-border bg-ui-surface p-4 pb-safe shadow-[0_-6px_28px_rgba(5,20,36,0.1)]">
          <div className="mb-4 flex items-end justify-between px-1">
             <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-wider text-ui-copy">{tienePreciosPendientes ? 'Subtotal conocido' : 'Total de piezas'}</p>
                {tienePreciosPendientes && <p className="mt-1 max-w-44 text-xs leading-tight text-ui-copy">Hay piezas con precio por confirmar.</p>}
             </div>
             {/* La `key` es el total: el número salta cuando cambia. */}
             <div key={cartTotal} className="text-3xl font-black tabular-nums tracking-tight text-ui-ink animate-pop">
               ${cartTotal.toFixed(2)}
             </div>
          </div>

          <div className="grid h-14 grid-cols-[1fr_2fr] gap-3">
            <button
               onClick={handleCopyClick}
               disabled={cart.length === 0}
               className={`press flex flex-col items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50 ${
                 copied
                   ? 'border-brand-bg bg-brand-bg text-white dark:border-white dark:bg-white dark:text-brand-bg'
                   : 'border-ui-border bg-ui-surface text-ui-ink hover:bg-ui-muted'
               }`}
            >
               {copied ? <Check key="listo" size={20} className="mb-0.5 animate-check-in" /> : <FileText size={20} className="mb-0.5" />}
               <span className="text-[10px] font-bold uppercase">{copied ? '¡Listo!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`press flex items-center justify-center gap-2 rounded-xl text-lg font-bold ${
                cart.length === 0
                  ? 'cursor-not-allowed bg-ui-muted text-ui-copy'
                  : 'bg-wa text-brand-bg shadow-lg shadow-wa/20 hover:bg-wa-hover'
              }`}
            >
              <MessageCircle size={24} className="fill-current" aria-hidden="true" />
              <span>Pedir</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- ENVÍO EN LA PROFORMA --- */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsShippingModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-[2rem] border border-ui-border bg-ui-surface p-6 shadow-2xl animate-scale-up">
            <button
              onClick={() => setIsShippingModalOpen(false)}
              aria-label="Cerrar"
              className="press absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ui-muted text-ui-copy hover:text-ui-ink"
            >
              <X size={20} />
            </button>

            <div className="mb-6 flex flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange-action dark:text-brand-orange">
                <Truck size={28} aria-hidden="true" />
              </div>
              <h3 className="text-center text-xl font-black text-ui-ink">
                ¿Incluir el envío?
              </h3>
              <p className="mt-1 text-center text-sm text-ui-copy">
                Se suma a la proforma antes de copiarla.
              </p>
            </div>

            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setHasShipping(!hasShipping)}
                aria-pressed={hasShipping}
                className={`press flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left ${
                  hasShipping
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'border-ui-border bg-ui-muted hover:border-ui-copy/40'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-200 ${
                    hasShipping ? 'border-brand-orange-action bg-brand-orange-action' : 'border-ui-copy/50 bg-ui-surface'
                  }`}>
                    {hasShipping && <Check size={12} className="text-white animate-check-in" strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <span className={`font-bold ${hasShipping ? 'text-brand-orange-action dark:text-brand-orange' : 'text-ui-ink'}`}>
                    Agregar costo de envío
                  </span>
                </span>
              </button>

              {/* El campo aparece al activar el envío */}
              <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                hasShipping ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <label className="relative block">
                  <span className="sr-only">Costo del envío en dólares</span>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-ui-copy" aria-hidden="true">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className={`${campo} bg-ui-surface py-4 pl-8 pr-14 text-xl font-black tabular-nums`}
                    autoFocus={hasShipping}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-ui-copy" aria-hidden="true">USD</span>
                </label>
              </div>

              <button
                onClick={handleConfirmCopy}
                className="press flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-brand-bg text-lg font-bold text-white shadow-lg hover:bg-brand-orange-action dark:bg-white dark:text-brand-bg dark:hover:bg-brand-orange dark:hover:text-white"
              >
                <FileText size={20} aria-hidden="true" />
                Copiar proforma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
