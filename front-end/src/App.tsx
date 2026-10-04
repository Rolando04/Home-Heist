import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Heist from './pages/Heist'
import Contact from './pages/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/heist" element={<Heist />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
        <Footer />
      </BrowserRouter>
   
  )
}

export default App
