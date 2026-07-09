import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FullPageLoader from './FullPageLoader';

export default function ProtectedRoute() {
  const { user, loading, manualLoginRequired } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user || manualLoginRequired) return <Navigate to="/login" replace />;

  return <Outlet />;
}
