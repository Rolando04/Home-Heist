
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
            <a href="#">Home</a>
            <a href="#">Heist</a>
            <a href="#">Contact</a>
        </div>
        </div>
    </header>
  )
}

export default Header