import { useEffect, useState } from 'react';

/*
  El despiece (utils/despiece.ts) se carga en su propio archivo.

  Sus reglas usan lookbehind (`(?<!SUPER\s*)WOLF`), que Safari sólo entiende
  desde iOS 16.4. Con el build para Safari 13 esas expresiones se vuelven
  `new RegExp(...)` y, en un iPhone viejo, lanzan un error al cargar el
  archivo. Si estuvieran en el archivo principal, la página quedaría en
  blanco; así, sólo falla esta carga y el catálogo sigue sin el filtro por
  moto ni el "Sirve para".

  Se pide apenas arranca la app (no espera a que el cliente elija una moto) y
  se guarda: todas las pantallas comparten la misma carga.
*/

export type Despiece = typeof import('./despiece');

let promesa: Promise<Despiece | null> | null = null;
let cargado: Despiece | null = null;
let fallo = false;

export function cargarDespiece(): Promise<Despiece | null> {
  if (!promesa) {
    promesa = import('./despiece').then(
      modulo => { cargado = modulo; return modulo; },
      error => {
        console.warn('Este navegador no pudo cargar el despiece por moto:', error);
        fallo = true;
        return null;
      },
    );
  }
  return promesa;
}

/** El despiece, o null mientras carga (`noDisponible` si el navegador no puede). */
export function useDespiece(): { despiece: Despiece | null; noDisponible: boolean } {
  const [despiece, setDespiece] = useState<Despiece | null>(cargado);
  const [noDisponible, setNoDisponible] = useState(fallo);

  useEffect(() => {
    if (cargado) return;
    let vigente = true;
    cargarDespiece().then(modulo => {
      if (!vigente) return;
      if (modulo) setDespiece(modulo);
      else setNoDisponible(true);
    });
    return () => { vigente = false; };
  }, []);

  return { despiece, noDisponible };
}
