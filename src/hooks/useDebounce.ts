import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configuramos un temporizador
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si el valor cambia antes de terminar el tiempo, limpiamos el anterior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}