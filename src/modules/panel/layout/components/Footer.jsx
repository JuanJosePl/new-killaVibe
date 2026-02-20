// src/modules/customer/layout/components/Footer.jsx

import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Términos y Condiciones', href: '#terms' },
    { label: 'Política de Privacidad', href: '#privacy' },
    { label: 'Centro de Ayuda', href: '#help' },
    { label: 'Contacto', href: '/customer/contact' },
  ];

  const socialLinks = [
    { icon: '📘', label: 'Facebook', href: '#' },
    
    { icon: '📸', label: 'Instagram', href: '#' },
    { icon: '🐦', label: 'Twitter', href: '#' },
    { icon: '💼', label: 'LinkedIn', href: '#' },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                KillaVibes
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tu destino premium para productos de calidad. Compra con confianza y estilo.
              </p>

              <div className="flex items-center gap-2">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    title={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Enlaces Rápidos
              </h4>
              <ul className="space-y-2">
                {footerLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-slate-400 rounded-full group-hover:bg-indigo-600 group-hover:scale-150 transition-all" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Newsletter
              </h4>
              <p className="text-sm text-slate-600">
                Suscríbete para recibir ofertas exclusivas y novedades.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button className="px-4 py-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all hover:scale-105">
                  ✉️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 text-center md:text-left">
              © {currentYear} KillaVibes. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Aceptamos:</span>
              <div className="flex items-center gap-1">
                {['💳', '💰', '🏦', '📱'].map((icon, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    title="Método de pago"
                  >
                    <span className="text-sm">{icon}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              Hecho con <span className="text-red-500 animate-pulse">❤️</span> en Colombia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
