// src/modules/customer/layout/components/CartButton.jsx

import React from "react";

const CartButton = ({
  icon = "🛒",
  count = 0,
  onClick,
  title = "Carrito",
  variant = "desktop",
}) => {
  const isDesktop = variant === "desktop";
  const isMobile = variant === "mobile";

  return (
    <button
      onClick={onClick}
      className={`
        relative rounded-xl transition-all duration-200 hover:scale-105 group
        ${
          isDesktop
            ? "p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200"
            : "p-2 hover:bg-slate-100"
        }
      `}
      title={title}
    >
      <span
        className={`
        group-hover:scale-110 transition-transform
        ${isDesktop ? "text-lg" : "text-xl"}
`}
      >
        {icon}
      </span>
      {count > 0 && (
        <div
          className={`
      absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 bg-red-500 text-white 
      rounded-full flex items-center justify-center text-xs font-bold px-1 
      shadow-md border-2 border-white animate-pulse-glow
      ${isMobile ? "min-w-[1.125rem] h-4.5" : ""}
    `}
        >
          {count > 99 ? "99+" : count}
        </div>
      )}
    </button>
  );
};
export default CartButton;
