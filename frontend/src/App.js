import React, { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import apiService from './services/apiService';
import { Layout } from './components/Layout';
import { Wildlife } from './pages/Wildlife';
import WildlifeDetails from './pages/WildlifeDetails';
import Admin from './pages/Admin';
import AddCategory from './pages/AddCategory';
import AddWildlife from './pages/AddWildlife';
import EditCategory from './pages/EditCategory';

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

  const test = {
    name: "Western Tiger Swallowtail",
    scientificName: "Papilio rutulus",
    family: "Swallowtails",
    description: "boldly colored black and yellow with four broad black stripes crossing the forewing and the innermost stripe continuing across the hindwing. The trailing edges of both wings have broad black margins with yellow crescents.",
    images: [
      {file: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/WESTERN_TIGER_SWALLOWTAIL1.jpe", alt: "aerial view of wings"},
      {file: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/WESTERN_TIGER_SWALLOWTAIL3.jpe", alt: "test"},
      {file: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/WESTERN_TIGER_SWALLOWTAIL4.jpe", alt: "test"},
      {file: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2022/09/Swallowtail_Western_CCook.jpg", alt: "test"}
    ]
  }

  return (
    <div className="App">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<h1 className="text-3xl font-bold underline">Home</h1>} />
            <Route path="/about" element={<h1 className="text-3xl font-bold underline">About</h1>} />
            <Route path="/wildlife" element={<Wildlife/>} />
            <Route path="/wildlife-details" element={<WildlifeDetails wildlife={test}/>} /> {/* TEMP SOLUTION TO VISUALIZE DESIGN*/}
            <Route path="/admin" element={<Admin />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/add-wildlife" element={<AddWildlife />} />
            <Route path="/edit-category" element={<EditCategory />} />
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
