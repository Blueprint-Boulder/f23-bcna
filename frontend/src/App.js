import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import apiService from './services/apiService';
import { Layout } from './components/Layout';
import { Wildlife } from './pages/Wildlife';
import { WildlifePage } from './pages/WildlifePage';

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
            <Route path="/wildlife" element={<Wildlife/>}/>
            <Route path='/wildlife/*' element={<WildlifePage/>}/>
            <Route path="/api" element={<h1 className="text-3xl font-bold underline">{message}</h1>} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
