
import { Link } from 'react-router-dom'
import '../index.css'


function Header() {

  return (
    <header className="header">
    <div className="header-container">
        <div className="Logo">
            <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="Logo" />
            <h1>Home Heist</h1>
        </div>

        <div className="nav">
            <Link to="/">Home</Link>
            <Link to="/heist">Heist</Link>
            <Link to="/contact">Contact</Link>
        </div>
        </div>
    </header>
  )
}

export default Header