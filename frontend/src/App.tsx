import { Routes, Route } from 'react-router-dom';
import { HomePage, Dashboard, SupportPage } from './pages';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/support" element={<SupportPage />} />
        </Routes>
    );
}

export default App;