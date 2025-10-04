import { Navigate } from 'react-router-dom';
import { isUserOnboarded } from '@/utils/localStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const onboarded = isUserOnboarded();

  if (!onboarded) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
