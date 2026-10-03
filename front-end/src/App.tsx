import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {Link} from 'react-router-dom'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Heist from './pages/Heist'
import Contact from './pages/Contact'

function App() {
  return (
    <BrowserRouter>
      <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/heist" element={<Heist />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
