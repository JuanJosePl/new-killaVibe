// src/modules/customer/components/contact/ContactInfoCard.jsx

import React from "react";

/**
 * ============================================
 * 📋 CONTACTINFOCARD - TARJETA DE INFORMACIÓN
 * ============================================
 *
 * Componente reutilizable para mostrar información de contacto
 *
 * Props:
 * - icon: string (emoji)
 * - title: string
 * - content: string
 * - gradient: string (opcional, ej: "from-blue-500 to-purple-600")
 */
const ContactInfoCard = ({ icon, title, content, gradient }) => {
  return (
    <div className="card card-hover p-6 group animate-scale-in">
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
            gradient || "from-blue-500 to-purple-600"
          } flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-muted-foreground">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoCard;
