import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Dashboard from './Dashboard';
import SupportPage from './SupportPage';

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