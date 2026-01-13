import React, { useState, useEffect } from 'react';
import { useCustomerProfile } from '../context/CustomerProfileContext';

// ============================================
// 🎨 PROFILE HEADER - HERO SECTION 3D
// ============================================
const ProfileHeader = ({ user, onEdit, daysSinceRegistration }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative overflow-hidden rounded-3xl p-8 mb-8 animate-fade-in-up"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transition-transform duration-1000 ${isHovered ? 'scale-150' : 'scale-100'}`} />
        <div className={`absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl transition-transform duration-1000 ${isHovered ? 'scale-150' : 'scale-100'}`} />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-8">
        {/* Avatar 3D */}
        <div className="flex items-start gap-6">
          <div className="relative group">
            {/* Avatar Container */}
            <div className={`w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-xl border-4 border-white/50 overflow-hidden shadow-glow-primary transition-all duration-500 ${isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}`}>
              {user.profile?.avatar ? (
                <img 
                  src={user.profile.avatar} 
                  alt={`${user.profile.firstName} ${user.profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-6xl font-bold text-white">
                  {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                </div>
              )}
            </div>
            
            {/* Edit Badge */}
            <button
              onClick={onEdit}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform"
              title="Editar perfil"
            >
              ✏️
            </button>

            {/* Member Badge */}
            <div className="absolute -top-2 -left-2 w-12 h-12 bg-amber-400 rounded-full shadow-lg flex items-center justify-center font-bold text-white border-4 border-white animate-pulse-glow">
              🏆
            </div>
          </div>

          {/* User Info */}
          <div className="text-white">
            <h1 className="text-5xl font-black mb-2 animate-slide-in">
              {user.profile?.firstName} {user.profile?.lastName}
            </h1>
            <p className="text-xl text-white/80 mb-4 flex items-center gap-2">
              <span>👤</span>
              Cliente Premium
              {user.emailVerified && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold ml-2">
                  ✓ Verificado
                </span>
              )}
            </p>
            
            {/* Quick Stats */}
            <div className="flex gap-4 mt-4">
              <StatPill icon="📧" label="Email" value={user.email} />
              <StatPill icon="📅" label="Miembro" value={`${daysSinceRegistration} días`} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="btn bg-white/20 backdrop-blur-xl border-2 border-white/50 text-white hover:bg-white/30 hover-lift flex items-center gap-2 px-4 py-2 rounded-lg">
            <span>📊</span> <span className="hidden sm:inline">Stats</span>
          </button>
          <button className="btn bg-white/20 backdrop-blur-xl border-2 border-white/50 text-white hover:bg-white/30 hover-lift flex items-center gap-2 px-4 py-2 rounded-lg">
            <span>🎁</span> <span className="hidden sm:inline">Rewards</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 STAT PILL COMPONENT
// ============================================
const StatPill = ({ icon, label, value }) => (
  <div className="glass-frosted rounded-2xl px-4 py-2 flex items-center gap-2 hover-scale">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-sm font-bold text-white line-clamp-1">{value}</p>
    </div>
  </div>
);

// ============================================
// 📝 PROFILE FORM - EDITABLE
// ============================================
const ProfileForm = ({ formData, onInputChange, onSave, onCancel, isEditing, isSaving, error, onStartEdit }) => {
  return (
    <div className="card p-8 mb-8 animate-scale-in">
      {/* Header con botón de editar */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <span>👤</span> Información Personal
        </h3>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <span>✏️</span>
            Editar Perfil
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-start gap-3 animate-slide-in">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">Error al actualizar perfil</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              disabled={!isEditing || isSaving}
              className="input-base"
              placeholder="Juan"
              minLength={2}
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="label">
              Apellido <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              disabled={!isEditing || isSaving}
              className="input-base"
              placeholder="Pérez"
              minLength={2}
              maxLength={50}
              required
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            disabled
            className="input-base opacity-75 cursor-not-allowed"
          />
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <span>ℹ️</span>
            El email no puede ser modificado. Contacta soporte si necesitas cambiarlo.
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="label">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            disabled={!isEditing || isSaving}
            placeholder="+57 300 123 4567"
            className="input-base"
            pattern="[0-9\s\-\+()]*"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Formato: +57 300 123 4567
          </p>
        </div>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-all hover-lift shadow-lg"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Guardando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>💾</span>
                Guardar Cambios
              </span>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 font-semibold disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🔐 SECURITY SECTION
// ============================================
const SecuritySection = ({ onChangePassword }) => {
  return (
    <div className="card card-hover p-6 mb-8 animate-scale-in delay-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">
          🔒
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Seguridad</h3>
          <p className="text-sm text-muted-foreground">Protege tu cuenta</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Mantén tu cuenta segura actualizando tu contraseña regularmente
        </p>

        {/* Change Password Button */}
        <button
          onClick={onChangePassword}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg hover-lift flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:scale-110 transition-transform">🔑</span>
          <span>Cambiar Contraseña</span>
        </button>

        {/* Security Tips */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>💡</span>
            Tips de Seguridad:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 pl-4">
            <li>• Usa contraseñas únicas y complejas</li>
            <li>• Nunca compartas tu contraseña</li>
            <li>• Cambia tu contraseña cada 90 días</li>
            <li>• Usa al menos 8 caracteres con símbolos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎯 CHANGE PASSWORD MODAL
// ============================================
const ChangePasswordModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: 'Débil', color: 'bg-red-500' };
    if (strength <= 4) return { level: 2, text: 'Media', color: 'bg-yellow-500' };
    return { level: 3, text: 'Fuerte', color: 'bg-green-500' };
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      setError('La contraseña actual es requerida');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🔒 Cambiar Contraseña
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none transition-colors disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2 animate-slide-in">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="label">
              Contraseña Actual <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                disabled={isLoading}
                required
                className="input-base pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform"
                tabIndex={-1}
              >
                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label">
              Nueva Contraseña <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
                className="input-base pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform"
                tabIndex={-1}
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {passwordStrength.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">
              Confirmar Nueva Contraseña <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={isLoading}
                required
                className="input-base pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform"
                tabIndex={-1}
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {formData.confirmPassword && (
              <p className={`text-xs mt-1 ${formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {formData.newPassword === formData.confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Cambiando...
                </span>
              ) : (
                'Cambiar Contraseña'
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>Consejos de Seguridad:</span>
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Usa al menos 8 caracteres</li>
            <li>Combina mayúsculas, minúsculas y números</li>
            <li>Incluye símbolos (@, #, $, !, etc.)</li>
            <li>Evita contraseñas obvias o datos personales</li>
            <li>No reutilices contraseñas de otras cuentas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ⚠️ DANGER ZONE
// ============================================
const DangerZone = ({ onDeleteAccount }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (window.confirm('⚠️ ¿Estás seguro? Esta acción NO se puede deshacer. Tu cuenta y todos tus datos serán eliminados permanentemente.')) {
      onDeleteAccount();
    }
  };

  return (
    <div className="card p-6 border-2 border-red-200 animate-scale-in delay-300">
      <h3 className="text-lg font-semibold mb-2 text-red-600 flex items-center gap-2">
        ⚠️ Zona de Peligro
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Esta acción es irreversible. Tu cuenta y todos tus datos serán eliminados permanentemente.
      </p>
      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors hover:shadow-lg"
      >
        Eliminar Cuenta
      </button>
    </div>
  );
};

// ============================================
// 🎯 MAIN PROFILE PAGE
// ============================================
const CustomerProfilePage = () => {
  const {
    profile,
    isLoading,
    updateProfile,
    changePassword,
    deleteAccount,
    getDaysSinceRegistration,
  } = useCustomerProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Sincronizar formData con profile
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.profile?.firstName || '',
        lastName: profile.profile?.lastName || '',
        email: profile.email || '',
        phone: profile.profile?.phone || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      setIsEditing(false);
      alert('✅ Perfil actualizado exitosamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (profile) {
      setFormData({
        firstName: profile.profile?.firstName || '',
        lastName: profile.profile?.lastName || '',
        email: profile.email || '',
        phone: profile.profile?.phone || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleChangePassword = async (passwordData) => {
    try {
      setIsChangingPassword(true);
      
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      alert('✅ Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
    } catch (err) {
      throw new Error(err.message || 'Error al cambiar contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      alert('✅ Cuenta eliminada exitosamente');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-xl font-semibold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl font-semibold">No se pudo cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <ProfileHeader
          user={profile}
          onEdit={handleStartEdit}
          daysSinceRegistration={getDaysSinceRegistration()}
        />

        {/* Profile Form */}
        <ProfileForm
          formData={formData}
          onInputChange={handleInputChange}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={isEditing}
          isSaving={isSaving}
          error={error}
          onStartEdit={handleStartEdit}
        />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Security Section */}
          <SecuritySection onChangePassword={() => setShowPasswordModal(true)} />

          {/* Danger Zone */}
          <DangerZone onDeleteAccount={handleDeleteAccount} />
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handleChangePassword}
          isLoading={isChangingPassword}
        />
      </div>
    </div>
  );
};

export default CustomerProfilePage;