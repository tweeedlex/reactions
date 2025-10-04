import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SupportRouteProps {
  children: React.ReactNode;
}

export function SupportRoute({ children }: SupportRouteProps) {
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
  
  const { user, loading, initialized, hasCompany, userRole } = authContext;

  console.log('🛟 SupportRoute: State check', { 
    loading, 
    initialized, 
    hasUser: !!user, 
    hasCompany,
    userRole
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
    console.log('🛟 SupportRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Якщо користувач авторизований, але не має компанії, перенаправляємо на налаштування
  if (!hasCompany) {
    console.log('🛟 SupportRoute: No company, redirecting to /setup');
    return <Navigate to="/setup" replace />;
  }

  console.log('🛟 SupportRoute: All checks passed, rendering children');

  return <>{children}</>;
}
