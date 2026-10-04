import '../index.css'

function Home() {
  return (
    <div>
      <div className="hero">
        <div className="hero-intro">
          <h1>Meet the Team</h1>
        </div>
        <div className="hero-content">
          <img src="../src/assets/James_hero.jpg" alt="Hero" className="hero-image" />
          <h2>James Haddock</h2>
          <p>Senior</p>
        </div>
        <div className="hero-content">
          <img src="../src/assets/jglad_hero.jpeg" alt="Hero" className="hero-image" />
          <h2>James Gladden</h2>
          <p>Graduate</p>
        </div>
        <div className="hero-content">
          <img src="../src/assets/REC_hero.jpeg" alt="Hero" className="hero-image" />
          <h2>Rolando Castrellon</h2>
          <p>Senior</p>
        </div>
     </div>
     <div className="about-section">
        <h2>About Us</h2>
        <p>We are a team comprised of 2 UTSA students and a MBA graduate, working on a project to help veterans and low-income families find loan options that are a genuine steal.
          Our goal is to provide resources and information to help these individuals find the most affordable home loans while promoting local and smaller financial institutions</p>
      </div>
    </div>
  )
}
///Users/rolandocastrellon/Documents/GitHub/Home-Heist/Home-Heist/front-end/src/assets/hero.png
export default Home