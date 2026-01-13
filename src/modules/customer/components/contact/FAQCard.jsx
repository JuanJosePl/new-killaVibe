// src/modules/customer/components/contact/FAQCard.jsx

import React, { useState } from "react";

/**
 * ============================================
 * ❓ FAQCARD - PREGUNTAS FRECUENTES
 * ============================================
 *
 * Componente de acordeón para preguntas frecuentes
 *
 * Props:
 * - question: string
 * - answer: string
 */
const FAQCard = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="card card-hover p-6 cursor-pointer group animate-scale-in"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
            {question}
          </h4>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-muted-foreground leading-relaxed">{answer}</p>
          </div>
        </div>
        <div
          className={`text-2xl transition-transform duration-300 flex-shrink-0 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          {isOpen ? "🔼" : "🔽"}
        </div>
      </div>
    </div>
  );
};

export default FAQCard;
