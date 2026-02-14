import { createContext, useState, useEffect, useCallback } from 'react';

// ✅ Crear el contexto
export const ThemeContext = createContext(null);

// ✅ Clave para localStorage
const THEME_STORAGE_KEY = 'killavibes_theme';

// ✅ Temas disponibles
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.SYSTEM);
  const [resolvedTheme, setResolvedTheme] = useState(THEMES.LIGHT);

  // ✅ Función para obtener el tema del sistema
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return THEMES.LIGHT;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEMES.DARK 
      : THEMES.LIGHT;
  }, []);

  // ✅ Función para resolver el tema actual
  const resolveTheme = useCallback((currentTheme) => {
    if (currentTheme === THEMES.SYSTEM) {
      return getSystemTheme();
    }
    return currentTheme;
  }, [getSystemTheme]);

// ✅ Agregar transiciones suaves
  const applyTheme = useCallback((themeToApply) => {
    const root = window.document.documentElement;
  
    // ✅ Evitar "flash" al cambiar tema
    root.classList.add('theme-transitioning');
    
    // Remover clases anteriores
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    
    // Agregar la nueva clase
    root.classList.add(themeToApply);

    // ✅ Remover clase de transición después de 200ms
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 200);
    
    // Actualizar el meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        themeToApply === THEMES.DARK ? '#1e293b' : '#ffffff'
      );
    }
  }, []);

  // ✅ Función para guardar en localStorage
  const saveToStorage = useCallback((themeValue) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeValue);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, []);

  // ✅ Función para cargar de localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && Object.values(THEMES).includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
    return THEMES.SYSTEM;
  }, []);

  // ✅ Función para cambiar el tema
  const setThemeValue = useCallback((newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error('Invalid theme:', newTheme);
      return;
    }

    setTheme(newTheme);
    saveToStorage(newTheme);

    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [resolveTheme, applyTheme, saveToStorage]);

  // ✅ Toggle entre light y dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setThemeValue(newTheme);
  }, [resolvedTheme, setThemeValue]);

  // ✅ Inicializar: Cargar tema de localStorage
  useEffect(() => {
    const storedTheme = loadFromStorage();
    const resolved = resolveTheme(storedTheme);
    
    setTheme(storedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [loadFromStorage, resolveTheme, applyTheme]);

  // ✅ Escuchar cambios en el tema del sistema
  useEffect(() => {
    if (theme !== THEMES.SYSTEM) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newResolvedTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
      setResolvedTheme(newResolvedTheme);
      applyTheme(newResolvedTheme);
    };

    // Usar el método correcto según el navegador
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, applyTheme]);

  // ✅ Valor del contexto
  const value = {
    theme,              // Tema seleccionado: 'light', 'dark', 'system'
    resolvedTheme,      // Tema real aplicado: 'light' o 'dark'
    setTheme: setThemeValue,
    toggleTheme,
    isDark: resolvedTheme === THEMES.DARK,
    isLight: resolvedTheme === THEMES.LIGHT,
    THEMES              // Constantes de temas disponibles
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}