// src/modules/customer/components/profile/ProfileHeader.jsx

import React from 'react';

/**
 * @component ProfileHeader
 * @description Header del perfil con avatar y datos principales
 * 
 * @props {string} fullName - Nombre completo
 * @props {string} email - Email del usuario
 * @props {string} avatar - URL del avatar (opcional)
 * @props {string} initials - Iniciales (fallback)
 * @props {boolean} isEmailVerified - Email verificado
 * @props {number} daysSinceRegistration - Días desde registro
 */
const ProfileHeader = ({
  fullName,
  email,
  avatar,
  initials = '?',
  isEmailVerified = false,
  daysSinceRegistration = 0,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white rounded-t-lg">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold shadow-lg flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{fullName}</h2>
          
          {/* Email with verification badge */}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-blue-100">{email}</p>
            {isEmailVerified && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                ✓ Verificado
              </span>
            )}
          </div>

          {/* Membership info */}
          <p className="text-blue-200 text-sm mt-2">
            Miembro desde hace {daysSinceRegistration} días
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;