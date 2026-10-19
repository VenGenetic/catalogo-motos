import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/*
  La moto del cliente.

  · El selector de motos es uno solo para toda la página (inicio, catálogo,
    barra inferior): cualquiera lo abre con `abrirSelector`.
  · La última moto elegida se recuerda en el navegador: al volver, el inicio y
    la barra inferior la ofrecen con un toque ("Tu moto: Wolf 250").
  · Elegir una moto abre su despiece (/catalogo/wolf-250) y conserva lo que el
    cliente estaba buscando: "faro" + Wolf 250 son los faros de la Wolf.
*/

const CLAVE = 'lv_mi_moto';

const leer = (): string | null => {
  try { return window.localStorage.getItem(CLAVE); } catch { return null; }
};
const guardar = (id: string | null) => {
  try {
    if (id) window.localStorage.setItem(CLAVE, id);
    else window.localStorage.removeItem(CLAVE);
  } catch { /* Safari privado: la moto sólo dura esta visita. */ }
};

interface MotoContextType {
  /** La última moto que eligió el cliente (id del despiece). */
  miMoto: string | null;
  selectorAbierto: boolean;
  abrirSelector: () => void;
  cerrarSelector: () => void;
  /** Abre el despiece de la moto y la recuerda. */
  elegirMoto: (id: string) => void;
  /** Sólo la recuerda (para los enlaces que ya llevan a su despiece). */
  recordarMoto: (id: string) => void;
  /** Vuelve al catálogo completo, sin olvidar la moto. */
  quitarMoto: () => void;
  olvidarMoto: () => void;
}

const MotoContext = createContext<MotoContextType | undefined>(undefined);

export const MotoProvider = ({ children }: { children: ReactNode }) => {
  const [miMoto, setMiMoto] = useState<string | null>(leer);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lo que se buscaba sigue buscado con la otra moto (sólo dentro del catálogo).
  const busquedaActual = useCallback(() => {
    if (!location.pathname.startsWith('/catalogo')) return '';
    const q = new URLSearchParams(location.search).get('q');
    return q ? `?q=${encodeURIComponent(q)}` : '';
  }, [location.pathname, location.search]);

  const recordarMoto = useCallback((id: string) => {
    setMiMoto(id);
    guardar(id);
  }, []);

  const elegirMoto = useCallback((id: string) => {
    recordarMoto(id);
    setSelectorAbierto(false);
    navigate(`/catalogo/${encodeURIComponent(id)}${busquedaActual()}`);
  }, [navigate, busquedaActual, recordarMoto]);

  const quitarMoto = useCallback(() => {
    navigate(`/catalogo${busquedaActual()}`);
  }, [navigate, busquedaActual]);

  const olvidarMoto = useCallback(() => {
    setMiMoto(null);
    guardar(null);
  }, []);

  const abrirSelector = useCallback(() => setSelectorAbierto(true), []);
  const cerrarSelector = useCallback(() => setSelectorAbierto(false), []);

  const valor = useMemo(() => ({
    miMoto,
    selectorAbierto,
    abrirSelector,
    cerrarSelector,
    elegirMoto,
    recordarMoto,
    quitarMoto,
    olvidarMoto,
  }), [miMoto, selectorAbierto, abrirSelector, cerrarSelector, elegirMoto, recordarMoto, quitarMoto, olvidarMoto]);

  return <MotoContext.Provider value={valor}>{children}</MotoContext.Provider>;
};

export const useMoto = () => {
  const context = useContext(MotoContext);
  if (!context) throw new Error('useMoto debe usarse dentro de MotoProvider');
  return context;
};
