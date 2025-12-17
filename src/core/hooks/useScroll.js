// hooks/use-scroll-to-top.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll suave al top en cada cambio de ruta o parámetros
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname, search]); // Se activa también con cambios en parámetros de búsqueda
} 

