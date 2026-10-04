import '../Contact.css';
import '../security.css'
function Contact() {
  return (
    <main className="contact-page">
      <div className="security-status">
        <span className="status-dot"></span>
        SECURITY ACTIVE
      </div>
      <h1>Contact the Team</h1>

      <div className="contact-grid">
        <div className="contact-card">
          <h2>James Haddock</h2>
          <p>Database Developer</p>
          <p>john@example.com</p>
          <div className="contact-links">
            <a href="https://www.linkedin.com/in/jamesahaddock/"target="_blank"rel="noopener noreferrer">LinkedIn</a>

            <a href="https://github.com/ProbablyJamesH"target="_blank"rel="noopener noreferrer">GitHub</a>
          </div>
        </div>

        <div className="contact-card">
          <h2>James Gladden</h2>
          <p>Backend Developer / AI Specialist</p>
          <p>jane@example.com</p>
          <div className="contact-links">
            <a href="https://www.linkedin.com/in/james-gladden-grc/"target="_blank"rel="noopener noreferrer">LinkedIn</a>

            <a href="https://github.com/jamesgladdenworld"target="_blank"rel="noopener noreferrer">GitHub</a>
          </div>
        </div>

        <div className="contact-card">
          <h2>Rolando Castrellon</h2>
          <p>Frontend Developer</p>
          <p>rolandoecastrellon@gmail.com</p>
          <div className="contact-links">
            <a href="https://www.linkedin.com/in/rolando-castrellon/"target="_blank"rel="noopener noreferrer">LinkedIn</a>

            <a href="https://github.com/Rolando04"target="_blank"rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Contact;