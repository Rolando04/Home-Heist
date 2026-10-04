
import "../Heist.css"

type HousingCardProps = {
  LoanName: string
  lender: string
  apr: number
  veteransEligible: boolean
  lowIncomeEligible: boolean
}

function HousingCard({ LoanName, lender, apr, veteransEligible, lowIncomeEligible }: HousingCardProps) {
  return (
    <div className="housing-card">
      <div className="housing-card-header">
        <h3>{LoanName}</h3>
        <p>{lender}</p>
      </div>

      <div className="housing-card-price">
        <h3>APR: {apr.toFixed(2)}%</h3>
      </div>

      <div className="housing-card-stats">
        <div>
          <h4>Veteran: {veteransEligible ? 'Yes' : 'No'}</h4>
          <h4>Low Income: {lowIncomeEligible ? 'Yes' : 'No'}</h4>
        </div>
      </div>
    </div>
  )
}

export default HousingCard