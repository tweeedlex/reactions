import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authContext = useAuth();
  
  // Перевіряємо чи AuthContext доступний
  if (!authContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Ініціалізація...</p>
        </div>
      </div>
    );
  }
  
  const { user, loading, hasCompany } = authContext;

  // Показуємо завантаження поки перевіряємо авторизацію
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Завантаження...</p>
        </div>
      </div>
    );
  }

  // Якщо користувач не авторизований, перенаправляємо на сторінку авторизації
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Якщо користувач авторизований, але не має компанії, перенаправляємо на налаштування
  if (!hasCompany) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
