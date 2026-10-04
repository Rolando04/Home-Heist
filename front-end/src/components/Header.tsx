
import { NavLink } from 'react-router-dom'
import '../index.css'


function Header() {

  return (
    <header className="header">
    <div className="header-container">
        <div className="Logo">
            <img src="../src/assets/Logo-RH.png" alt="Logo" />
            <h1>Home Heist</h1>
        </div>

        <div className="nav">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/heist">Heist</NavLink>
            <NavLink to="/contact">Contact</NavLink>
        </div>
        </div>
    </header>
  )
}

export default Header