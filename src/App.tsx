import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateKhatma from './pages/CreateKhatma';
import KhatmaPage from './pages/KhatmaPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CreateKhatma />} />
                <Route path="/khatma/:id" element={<KhatmaPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App; 