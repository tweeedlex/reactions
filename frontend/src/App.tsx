import { Routes, Route } from 'react-router-dom';
import { HomePage, Dashboard, SupportPage, AuthPage, BrandSetupPage, SubscriptionPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { SupportRoute } from './components/SupportRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/setup" element={
                <ProtectedRoute>
                    <BrandSetupPage />
                </ProtectedRoute>
            } />
            <Route
                path="/dashboard"
                element={
                    <AdminRoute>
                        <Dashboard />
                    </AdminRoute>
                }
            />
            <Route
                path="/support"
                element={
                    <SupportRoute>
                        <SupportPage />
                    </SupportRoute>
                }
            />
            <Route
                path="/subscription"
                element={
                    <AdminRoute>
                        <SubscriptionPage />
                    </AdminRoute>
                }
            />
        </Routes>
    );
}

export default App;