import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-full mb-6">
        <ShoppingBag size={64} className="text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Tu carrito está vacío
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
        ¡Parece que aún no has añadido nada a tu carrito! Explora nuestra tienda y encuentra los mejores productos para ti.
      </p>
      <Link 
        to="/productos" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-blue-500/30"
      >
        Ir a la tienda
      </Link>
    </div>
  );
};

export default EmptyCart;