
// src/core/hooks/useScroll.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * @hook useScrollToTop
 * @description Scroll automático al inicio al cambiar de ruta
 * 
 * Se ejecuta cada vez que cambia la ruta (pathname)
 * Útil para mejorar UX al navegar entre páginas
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll suave al inicio
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // Alternativa: scroll instantáneo
    // window.scrollTo(0, 0);
  }, [pathname]);
};

/**
 * @hook useScrollPosition
 * @description Obtiene la posición actual del scroll
 * 
 * @returns {Object} { x: number, y: number }
 */
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition;
};

/**
 * @hook useScrollDirection
 * @description Detecta la dirección del scroll (up/down)
 * 
 * @returns {string} 'up' | 'down' | null
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollDirection;
};

/**
 * @hook useScrollToElement
 * @description Scroll suave a un elemento específico
 * 
 * @returns {Function} scrollToElement(elementId: string)
 */
export const useScrollToElement = () => {
  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.warn(`[useScrollToElement] Element with id "${elementId}" not found`);
    }
  };

  return scrollToElement;
};

export default useScrollToTop;

