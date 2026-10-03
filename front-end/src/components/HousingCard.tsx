
import "../Heist.css"

function HousingCard() {
  return (
    <div className="housing-card">
      <div className="housing-card-header">
        <h3>Loan Product</h3>
        <p>Lender</p>
      </div>

      <div className="housing-card-price">
        <h3>APR Rate</h3>
      </div>

      <div className="housing-card-stats">
        <div>
          <h4>Veteran: y/n</h4>
          <h4>Low Income: y/n</h4>
        </div>
      </div>
    </div>
  )
}

export default HousingCard