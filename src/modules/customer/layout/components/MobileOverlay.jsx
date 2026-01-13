// src/modules/customer/layout/components/MobileOverlay.jsx

import React from 'react';

const MobileOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
    />
  );
};

export default MobileOverlay;