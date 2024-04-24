import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Wildlife } from './pages/Wildlife';
import WildlifeDetails from './pages/WildlifeDetails';
import Admin from './pages/Admin';
import AddCategory from './pages/AddCategory';
import AddWildlife from './pages/AddWildlife';
import EditCategory from './pages/EditCategory';
import EditWildlife from './pages/EditWildlife';

function App() {

  return (
    <div className="App">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" exact element={<h1 className="text-3xl font-bold underline">Home</h1>} />
            <Route path="/about" element={<h1 className="text-3xl font-bold underline">About</h1>} />
            <Route path="/wildlife" element={<Wildlife/>} />
            <Route path="/wildlife/:wildlifeId" element={<WildlifeDetails/>} /> 
            <Route path="/admin" element={<Admin />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/add-wildlife" element={<AddWildlife />} />
            <Route path="/edit-category" element={<EditCategory />} />
            <Route path="/edit-wildlife" element={<EditWildlife />} />
            <Route path="/checklists" element={<h1 className="text-3xl font-bold underline">Checklists</h1>} />
            <Route path="/resources" element={<h1 className="text-3xl font-bold underline">Resources</h1>} />
            <Route path="/contact" element={<h1 className="text-3xl font-bold underline">Contact Us</h1>} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
