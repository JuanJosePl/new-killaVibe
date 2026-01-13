// src/modules/admin/pages/Users/UserDetails.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserDetails, updateUser, toggleUserBan, deleteUser, loading } = useAdmin();
  
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    isActive: true,
    profile: {
      firstName: '',
      lastName: '',
      phone: ''
    }
  });

  useEffect(() => {
    loadUserDetails();
  }, [id]);

  const loadUserDetails = async () => {
  await getUserDetails(
    id,
    (response) => {
      // ✅ El usuario es 'response' directamente (o 'response.data' si usas el hook)
      // Basado en tu consola, la info está en la raíz del objeto recibido
      const userData = response.data || response; 

      setUser(userData);
      setFormData({
        role: userData.role || '',
        isActive: userData.isActive ?? true,
        profile: {
          firstName: userData.profile?.firstName || userData.firstName || '',
          lastName: userData.profile?.lastName || userData.lastName || '',
          phone: userData.profile?.phone || userData.phone || ''
        }
      });
    },
    (err) => {
      console.error('Error cargando usuario:', err);
      alert('Error al cargar usuario');
      navigate('/admin/users');
    }
  );
};
  const handleSave = async () => {
    await updateUser(
      id,
      formData,
      () => {
        loadUserDetails();
        setIsEditing(false);
        alert('Usuario actualizado exitosamente');
      },
      (err) => alert('Error: ' + err)
    );
  };

  const handleBan = async () => {
    const action = user.isActive ? 'banear' : 'activar';
    if (!confirm(`¿Estás seguro de ${action} este usuario?`)) return;
    
    await toggleUserBan(
      id,
      !user.isActive,
      !user.isActive ? 'Baneado desde panel admin' : '',
      () => {
        loadUserDetails();
        alert(`Usuario ${action}do exitosamente`);
      },
      (err) => alert('Error: ' + err)
    );
  };

  const handleDelete = async () => {
    if (!confirm('¿ELIMINAR este usuario permanentemente? Esta acción NO se puede deshacer.')) return;
    if (!confirm('¿Estás COMPLETAMENTE seguro? Se eliminarán todos sus datos.')) return;
    
    await deleteUser(
      id,
      () => {
        alert('Usuario eliminado exitosamente');
        navigate('/admin/users');
      },
      (err) => alert('Error: ' + err)
    );
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Volver a usuarios
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Detalles del Usuario
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ID: {user._id}
            </p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      role: user.role,
                      isActive: user.isActive,
                      profile: user.profile
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  Guardar cambios
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                ✏️ Editar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - Profile */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Avatar & Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
              {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.profile.firstName}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, firstName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={formData.profile.lastName}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, lastName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.profile.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.profile?.firstName} {user.profile?.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                {user.profile?.phone && (
                  <p className="text-gray-600 dark:text-gray-400">📱 {user.profile.phone}</p>
                )}
              </>
            )}
          </div>

          {/* Role & Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Rol y Estado</h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="customer">Customer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900 dark:text-white">Cuenta activa</span>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rol</p>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : user.role === 'moderator'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</p>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          {!isEditing && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-6">
              <h3 className="font-bold text-red-900 dark:text-red-200 mb-4">Zona de peligro</h3>
              <div className="space-y-2">
                <button
                  onClick={handleBan}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                >
                  {user.isActive ? '🚫 Banear usuario' : '✅ Activar usuario'}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  🗑️ Eliminar usuario
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Información de cuenta</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Email" value={user.email} />
              <InfoItem 
                label="Email verificado" 
                value={user.emailVerified ? '✅ Sí' : '❌ No'} 
              />
              <InfoItem 
                label="Fecha de registro" 
                value={new Date(user.createdAt).toLocaleDateString('es-ES')} 
              />
              <InfoItem 
                label="Último login" 
                value={user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'} 
              />
              <InfoItem 
                label="IP último login" 
                value={user.lastLoginIp || 'N/A'} 
              />
              <InfoItem 
                label="Intentos fallidos" 
                value={user.loginAttempts || 0} 
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Estadísticas</h3>
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Órdenes"
                value={user.stats?.totalOrders || 0}
                icon="🛒"
                color="blue"
              />
              <StatCard
                label="Total gastado"
                value={`$${(user.stats?.totalSpent || 0).toFixed(2)}`}
                icon="💰"
                color="green"
              />
              <StatCard
                label="Reviews"
                value={user.stats?.totalReviews || 0}
                icon="⭐"
                color="yellow"
              />
            </div>
          </div>

          {/* Login History */}
          {user.loginHistory && user.loginHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Historial de login (últimos 10)</h3>
              <div className="space-y-2">
                {user.loginHistory.slice(0, 10).map((login, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={login.success ? '✅' : '❌'}></span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {login.ip}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {login.userAgent?.slice(0, 50)}...
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(login.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}