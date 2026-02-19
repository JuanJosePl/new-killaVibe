/**
 * @hook useProductsRepository
 * @description Crea y memoiza una instancia del repository de productos
 * con el cliente HTTP correcto inyectado.
 *
 * Este hook es el punto de conexión entre React y el repository puro.
 * Garantiza que todos los hooks del módulo usen el mismo cliente HTTP.
 *
 * USO:
 *   const repo = useProductsRepository();
 *   const { products } = useProductList(repo);
 *
 * PARA ADMIN (con cliente auth):
 *   const repo = useProductsRepository({ useAdminClient: true });
 */

import { useMemo } from 'react';
import { createProductsRepository } from '../repository/products.repository';

// Importar el cliente HTTP apropiado.
// Ajustar según la configuración real del proyecto.
import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @param {Object} [options]
 * @param {boolean} [options.useAdminClient=false] - Usar cliente con permisos admin
 * @returns {import('../repository/products.repository').ProductsRepository}
 */
export const useProductsRepository = (options = {}) => {
  const { useAdminClient = false } = options;

  const repository = useMemo(() => {
    // En el futuro, si se necesita un adminAxiosInstance, se puede inyectar aquí
    // sin cambiar ningún otro archivo del módulo.
    const client = axiosInstance;
    return createProductsRepository(client);
  }, [useAdminClient]);

  return repository;
};

export default useProductsRepository;