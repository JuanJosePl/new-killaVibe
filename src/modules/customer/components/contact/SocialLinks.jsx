// src/modules/customer/components/contact/SocialLinks.jsx

import React from 'react';

/**
 * ============================================
 * 🌐 SOCIALLINKS - REDES SOCIALES
 * ============================================
 * 
 * Componente para mostrar enlaces a redes sociales
 * Con iconos 3D y efectos hover
 */
const SocialLinks = () => {
  const socials = [
    { 
      icon: '📘', 
      label: 'Facebook', 
      color: 'from-blue-500 to-blue-600',
      url: 'https://facebook.com' 
    },
    { 
      icon: '📷', 
      label: 'Instagram', 
      color: 'from-pink-500 to-rose-600',
      url: 'https://instagram.com' 
    },
    { 
      icon: '🐦', 
      label: 'Twitter', 
      color: 'from-sky-500 to-blue-600',
      url: 'https://twitter.com' 
    },
    { 
      icon: '💼', 
      label: 'LinkedIn', 
      color: 'from-blue-600 to-indigo-700',
      url: 'https://linkedin.com' 
    },
    { 
      icon: '📺', 
      label: 'YouTube', 
      color: 'from-red-500 to-red-600',
      url: 'https://youtube.com' 
    },
    { 
      icon: '💬', 
      label: 'TikTok', 
      color: 'from-gray-900 to-gray-800',
      url: 'https://tiktok.com' 
    },
  ];

  return (
    <div className="card p-8 text-center animate-scale-in">
      <h3 className="text-3xl font-bold mb-3">
        <span className="gradient-text">Síguenos en Redes Sociales</span>
      </h3>
      <p className="text-muted-foreground mb-8 text-lg">
        Mantente al día con nuestras últimas novedades, promociones exclusivas
        y contenido especial
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        {socials.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 p-6 bg-gradient-to-br hover:from-muted hover:to-muted/50 rounded-2xl transition-all hover-lift min-w-[120px] shadow-smooth"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`w-16 h-16 bg-gradient-to-br ${social.color} rounded-full flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              {social.icon}
            </div>
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {social.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;
