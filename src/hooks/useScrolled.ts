import { useEffect, useState } from 'react';

/**
 * ¿La página bajó más de `umbral` píxeles? Para que las barras fijas ganen
 * sombra sólo cuando hay contenido pasando por debajo. Un oyente pasivo y
 * un solo cambio de estado por cruce: no cuesta nada al desplazarse.
 */
export function useScrolled(umbral = 8): boolean {
  const [bajado, setBajado] = useState(() => typeof window !== 'undefined' && window.scrollY > umbral);
  useEffect(() => {
    let pendiente = false;
    const revisar = () => {
      pendiente = false;
      setBajado(window.scrollY > umbral);
    };
    const alMover = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(revisar);
    };
    window.addEventListener('scroll', alMover, { passive: true });
    revisar();
    return () => window.removeEventListener('scroll', alMover);
  }, [umbral]);
  return bajado;
}
