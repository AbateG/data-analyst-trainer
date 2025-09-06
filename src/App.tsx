import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SqlPage from './pages/SqlPage';
import PythonPage from './pages/PythonPage';
import ConceptualPage from './pages/ConceptualPage';
import ProgressPage from './pages/ProgressPage';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sql" element={<SqlPage />} />
            <Route path="/python" element={<PythonPage />} />
            <Route path="/conceptual" element={<ConceptualPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
