import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyStatus } from '@/utils/localStorage';

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
  
  const { user, loading, initialized, hasCompany } = authContext;

  console.log('🛡️ ProtectedRoute: State check', { 
    loading, 
    initialized, 
    hasUser: !!user, 
    hasCompany,
    localStorageCompany: getCompanyStatus()
  });

  // Показуємо завантаження поки не завершиться ініціалізація
  if (loading || !initialized) {
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
    console.log('🛡️ ProtectedRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Якщо користувач авторизований, але не має компанії, перенаправляємо на налаштування
  if (!hasCompany) {
    console.log('🛡️ ProtectedRoute: No company, redirecting to /setup');
    return <Navigate to="/setup" replace />;
  }

  console.log('🛡️ ProtectedRoute: All checks passed, rendering children');

  return <>{children}</>;
}
