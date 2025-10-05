import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Dashboard from './Dashboard';
import SupportPage from './SupportPage';
import SourcesPage from './SourcesPage';
import KanbanBoard from './KanbanBoard';
import TestKanban from './TestKanban';
import SimpleKanban from './SimpleKanban';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/test-kanban" element={<TestKanban />} />
            <Route path="/simple-kanban" element={<SimpleKanban />} />
        </Routes>
    );
}

export default App;