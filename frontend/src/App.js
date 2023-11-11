import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import apiService from './services/apiService';
import { Layout } from './components/Layout/Layout';

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getTest()
        console.log('data:', data)
        setMessage(data)
      } catch (error) {
        console.error('Error fetching test data:', error)
      }
    };

    fetchData()
  }, [])

  return (
    <div className="App">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<h1 className="text-3xl font-bold underline">Home</h1>} />
            <Route path="/about" element={<h1 className="text-3xl font-bold underline">About</h1>} />
            <Route path="/wildlife" element={<h1 className="text-3xl font-bold underline">Wildlife</h1>} />
            <Route path="/checklists" element={<h1 className="text-3xl font-bold underline">Checklists</h1>} />
            <Route path="/resources" element={<h1 className="text-3xl font-bold underline">Resources</h1>} />
            <Route path="/contact" element={<h1 className="text-3xl font-bold underline">Contact Us</h1>} />
            <Route path="/api" element={<h1 className="text-3xl font-bold underline">{message}</h1>} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
