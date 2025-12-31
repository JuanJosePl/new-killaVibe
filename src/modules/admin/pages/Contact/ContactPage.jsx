// src/modules/admin/pages/Contact/ContactPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { 
  Mail, Trash2, Eye, Reply, X, Send, Loader2, Search, 
  Filter, Calendar, Clock, User, CheckCircle, AlertCircle,
  RefreshCw, ArrowUpDown, ChevronLeft, ChevronRight,
  MessageSquare, TrendingUp, Archive, Inbox
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * @component ContactPage
 * @description Panel administrativo completo para gestión de mensajes de contacto
 * 
 * Features:
 * - Búsqueda en tiempo real con debounce
 * - Filtros avanzados (status, fecha, ordenamiento)
 * - Paginación completa
 * - Estadísticas de mensajes
 * - Vista detallada en modal
 * - Respuesta con validación
 * - Acciones en lote
 * - Animaciones suaves
 * - Dark mode optimizado
 */

const ContactPage = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const { 
    getContactMessages, 
    markContactAsRead, 
    replyToContactMessage, 
    deleteContactMessage,
    loading: apiLoading 
  } = useAdmin();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Data
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  
  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
  
  // UI State
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ============================================================================
  // DEBOUNCED SEARCH
  // ============================================================================
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  const fetchMessages = useCallback(async () => {
    try {
      await getContactMessages(filters, (data) => {
        const messagesArray = data?.messages || data || [];
        setContacts(Array.isArray(messagesArray) ? messagesArray : []);
        
        // Actualizar paginación
        if (data?.pagination) {
          setPagination(data.pagination);
        }
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error('Error al cargar mensajes');
    }
  }, [filters, getContactMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ============================================================================
  // STATISTICS (Calculadas del lado del cliente)
  // ============================================================================
  
  const stats = useMemo(() => {
    const total = pagination.total;
    const newCount = contacts.filter(c => c.status === 'new').length;
    const repliedCount = contacts.filter(c => c.status === 'replied').length;
    const readCount = contacts.filter(c => c.status === 'read').length;
    
    return {
      total,
      new: newCount,
      replied: repliedCount,
      read: readCount,
      pending: newCount + readCount
    };
  }, [contacts, pagination.total]);

  // ============================================================================
  // HANDLERS - ACTIONS
  // ============================================================================
  
  const handleViewMessage = async (msg) => {
    setSelectedMsg(msg);
    setReplyText('');
    
    // Marcar como leído si es nuevo
    if (msg.status === 'new') {
      try {
        await markContactAsRead(msg._id, () => {
          fetchMessages();
        });
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    // Validación frontend (según Joi del backend)
    const trimmedReply = replyText.trim();
    if (trimmedReply.length < 10) {
      toast.error('La respuesta debe tener al menos 10 caracteres');
      return;
    }
    if (trimmedReply.length > 2000) {
      toast.error('La respuesta no puede tener más de 2000 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await replyToContactMessage(
        selectedMsg._id, 
        trimmedReply,
        () => {
          toast.success('✅ Respuesta enviada correctamente');
          setReplyText('');
          setSelectedMsg(null);
          fetchMessages();
        },
        (error) => {
          toast.error(error || 'Error al enviar la respuesta');
        }
      );
    } catch (error) {
      toast.error('Error al enviar la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este mensaje? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await deleteContactMessage(id, () => {
        toast.success('Mensaje eliminado correctamente');
        fetchMessages();
      });
    } catch (error) {
      toast.error('Error al eliminar el mensaje');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedIds.size === 0) {
      toast.error('Selecciona al menos un mensaje');
      return;
    }
    
    const promises = Array.from(selectedIds).map(id => 
      markContactAsRead(id, () => {})
    );
    
    try {
      await Promise.all(promises);
      toast.success(`${selectedIds.size} mensajes marcados como leídos`);
      setSelectedIds(new Set());
      fetchMessages();
    } catch (error) {
      toast.error('Error al marcar mensajes');
    }
  };

  // ============================================================================
  // HANDLERS - FILTERS
  // ============================================================================
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setSelectedIds(new Set());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
    setSelectedIds(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    fetchMessages();
    toast.success('Lista actualizada');
  };

  const handleToggleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1
    }));
  };

  const handleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c._id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // ============================================================================
  // HELPERS
  // ============================================================================
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: Inbox, label: 'Nuevo' },
      read: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Eye, label: 'Leído' },
      replied: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckCircle, label: 'Respondido' },
      archived: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', icon: Archive, label: 'Archivado' }
    };
    
    const badge = badges[status] || badges.new;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ================================================================== */}
        {/* HEADER CON ESTADÍSTICAS */}
        {/* ================================================================== */}
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <MessageSquare className="text-white" size={28} />
                </div>
                Centro de Mensajes
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gestiona las consultas de tus clientes de forma eficiente
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={apiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={apiLoading ? 'animate-spin' : ''} />
              <span className="font-medium">Actualizar</span>
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={MessageSquare}
              label="Total"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={Inbox}
              label="Nuevos"
              value={stats.new}
              color="purple"
              highlight={stats.new > 0}
            />
            <StatCard
              icon={Eye}
              label="Leídos"
              value={stats.read}
              color="yellow"
            />
            <StatCard
              icon={CheckCircle}
              label="Respondidos"
              value={stats.replied}
              color="green"
            />
            <StatCard
              icon={AlertCircle}
              label="Pendientes"
              value={stats.pending}
              color="orange"
              highlight={stats.pending > 0}
            />
          </div>
        </div>

        {/* ================================================================== */}
        {/* FILTROS Y BÚSQUEDA */}
        {/* ================================================================== */}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* BÚSQUEDA */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o asunto..."
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* FILTRO DE STATUS */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Todos los estados</option>
                <option value="new">Nuevos</option>
                <option value="read">Leídos</option>
                <option value="replied">Respondidos</option>
                <option value="archived">Archivados</option>
              </select>
            </div>

            {/* ORDENAMIENTO */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-gray-400" size={20} />
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="createdAt">Fecha</option>
                <option value="name">Nombre</option>
                <option value="email">Email</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                {filters.sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>

          {/* ACCIONES EN LOTE */}
          {selectedIds.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedIds.size} mensaje{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleBulkMarkAsRead}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Marcar como leídos
              </button>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* TABLA DE MENSAJES */}
        {/* ================================================================== */}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {apiLoading && contacts.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Cargando mensajes...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <Mail className="text-gray-300 dark:text-gray-600 mb-4" size={64} />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No se encontraron mensajes</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Intenta cambiar los filtros de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === contacts.length && contacts.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </th>
                      <th className="p-4 text-left">
                        <button
                          onClick={() => handleToggleSort('name')}
                          className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <User size={16} />
                          Remitente
                          {filters.sortBy === 'name' && (
                            <span className="text-blue-600">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                          )}
                        </button>
                      </th>
                      <th className="p-4 text-left">
                        <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
                          <MessageSquare size={16} />
                          Asunto y Mensaje
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
                          <AlertCircle size={16} />
                          Estado
                        </div>
                      </th>
                      <th className="p-4 text-center">
                        <button
                          onClick={() => handleToggleSort('createdAt')}
                          className="flex items-center justify-center gap-2 font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                        >
                          <Clock size={16} />
                          Fecha
                          {filters.sortBy === 'createdAt' && (
                            <span className="text-blue-600">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
                          )}
                        </button>
                      </th>
                      <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-200">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {contacts.map((msg) => (
                      <tr
                        key={msg._id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all ${
                          msg.status === 'new' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        } ${selectedIds.has(msg._id) ? 'bg-blue-100/50 dark:bg-blue-900/20' : ''}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(msg._id)}
                            onChange={() => handleSelectOne(msg._id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {msg.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {msg.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail size={12} />
                                {msg.email}
                              </div>
                              {msg.phone && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  📞 {msg.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 max-w-md">
                          <div className="font-medium text-gray-800 dark:text-gray-200 truncate mb-1">
                            {msg.subject}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {msg.message}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(msg.status)}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatDate(msg.createdAt)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(msg.createdAt).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewMessage(msg)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all group relative"
                              title="Ver detalles"
                            >
                              <Eye size={18} />
                              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Ver detalles
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(msg._id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all group relative"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Eliminar
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {pagination.pages > 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando <span className="font-bold text-gray-900 dark:text-white">
                        {(pagination.current - 1) * pagination.limit + 1}
                      </span> a <span className="font-bold text-gray-900 dark:text-white">
                        {Math.min(pagination.current * pagination.limit, pagination.total)}
                      </span> de <span className="font-bold text-gray-900 dark:text-white">
                        {pagination.total}
                      </span> mensajes
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={pagination.current === 1}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      {/* PÁGINAS */}
                      <div className="flex items-center gap-1">
                        {[...Array(pagination.pages)].map((_, i) => {
                          const page = i + 1;
                          const isCurrentPage = page === pagination.current;
                          const isNearCurrent = Math.abs(page - pagination.current) <= 2;
                          const isFirstOrLast = page === 1 || page === pagination.pages;

                          if (!isNearCurrent && !isFirstOrLast) {
                            if (page === 2 || page === pagination.pages - 1) {
                              return <span key={page} className="px-2 text-gray-400">...</span>;
                            }
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                                isCurrentPage
                                  ?'bg-blue-600 text-white shadow-md'
: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
}`}
>
{page}
</button>
);
})}
</div> <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>

    {/* ================================================================== */}
    {/* MODAL DE DETALLE Y RESPUESTA */}
    {/* ================================================================== */}
    
    {selectedMsg && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-slideIn">
          
          {/* HEADER */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Mail className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalle del Mensaje
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recibido {formatDate(selectedMsg.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMsg(null)}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-all"
            >
              <X size={24} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* INFO DEL REMITENTE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-2">
                  <User size={12} />
                  Remitente
                </div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {selectedMsg.name}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-2">
                  <Mail size={12} />
                  Email
                </div>
                <div className="text-gray-900 dark:text-white font-medium break-all">
                  {selectedMsg.email}
                </div>
              </div>
              
              {selectedMsg.phone && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-2">
                    📞 Teléfono
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {selectedMsg.phone}
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-2">
                  <Calendar size={12} />
                  Fecha y Hora
                </div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {new Date(selectedMsg.createdAt).toLocaleString('es-ES', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </div>
              </div>
            </div>

            {/* ESTADO */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Estado actual:
              </span>
              {getStatusBadge(selectedMsg.status)}
            </div>

            {/* MENSAJE ORIGINAL */}
            <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                {selectedMsg.subject}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedMsg.message}
              </p>
            </div>

            {/* METADATA */}
            {(selectedMsg.ipAddress || selectedMsg.userAgent) && (
              <details className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400">
                  Información técnica
                </summary>
                <div className="mt-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  {selectedMsg.ipAddress && (
                    <div><strong>IP:</strong> {selectedMsg.ipAddress}</div>
                  )}
                  {selectedMsg.userAgent && (
                    <div><strong>User Agent:</strong> {selectedMsg.userAgent}</div>
                  )}
                </div>
              </details>
            )}

            {/* FORMULARIO DE RESPUESTA O RESPUESTA ENVIADA */}
            {selectedMsg.status !== 'replied' ? (
              <form onSubmit={handleReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2  items-center gap-2">
                    <Reply size={16} className="text-blue-600" />
                    Responder a {selectedMsg.name}
                  </label>
                  <textarea
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta aquí... (mínimo 10 caracteres)"
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white resize-none"
                    rows="6"
                  />
                  <div className="mt-2 flex justify-between text-xs">
                    <span className={`${
                      replyText.length < 10 ? 'text-red-500' : 
                      replyText.length > 2000 ? 'text-red-500' : 
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {replyText.length} / 2000 caracteres
                      {replyText.length < 10 && ' (mínimo 10)'}
                    </span>
                    {replyText.length >= 10 && replyText.length <= 2000 && (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Longitud válida
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    type="button" 
                    onClick={() => setSelectedMsg(null)}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || replyText.length < 10 || replyText.length > 2000}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Respuesta
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold mb-3">
                  <CheckCircle size={20} />
                  Respuesta enviada
                </div>
                <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap leading-relaxed">
                  {selectedMsg.reply || 'Mensaje respondido exitosamente'}
                </p>
                {selectedMsg.repliedAt && (
                  <div className="mt-3 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Clock size={12} />
                    Respondido el {new Date(selectedMsg.repliedAt).toLocaleString('es-ES', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
};
// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
const StatCard = ({ icon: Icon, label, value, color, highlight }) => {
const colors = {
blue: 'from-blue-500 to-blue-600',
purple: 'from-purple-500 to-purple-600',
yellow: 'from-yellow-500 to-yellow-600',
green: 'from-green-500 to-green-600',
orange: 'from-orange-500 to-orange-600'
};
return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg ${highlight ? 'ring-2 ring-blue-500 animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        {/* Corrección: Se añaden las comillas invertidas y las llaves para acceder al objeto colors */}
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color] || 'from-gray-500 to-gray-600'}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ANIMATIONS (Global Styles)
// ============================================================================
// Es mejor usar useEffect o un archivo CSS, pero si lo haces así, 
// asegúrate de que no se ejecute en cada renderizado.
if (typeof document !== 'undefined' && !document.getElementById('admin-animations')) {
  const style = document.createElement('style');
  style.id = 'admin-animations';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

export default ContactPage;