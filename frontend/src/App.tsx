import { Routes, Route } from 'react-router-dom';
import { HomePage, Dashboard, SupportPage, AuthPage, BrandSetupPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/setup" element={<BrandSetupPage />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/support"
                element={
                    <ProtectedRoute>
                        <SupportPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;