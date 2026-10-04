import "../Heist.css"

type HousingCardProps = {
  productName: string
  lender: string
  loanType: string
  termMonths: number
  interestRate: number
  apr: number
  minCreditScore: number
  maxCreditScore: number
  productLink: string
}

function HousingCard({
  productName,
  lender,
  loanType,
  termMonths,
  interestRate,
  apr,
  minCreditScore,
  maxCreditScore,
  productLink,
}: HousingCardProps) {
  return (
    <div className="housing-card">
      <div className="housing-card-header">
        <h3>{productName}</h3>
        <p>{lender}</p>
      </div>

      <div className="housing-card-price">
        <h3>APR: {Number(apr).toFixed(2)}%</h3>
      </div>

      <div className="housing-card-stats">
        <div>
          <h4>Interest Rate: {Number(interestRate).toFixed(2)}%</h4>
          <h4>Loan Type: {loanType}</h4>
          <h4>Term: {termMonths / 12} Years</h4>
          <h4>
            Credit Score: {minCreditScore} - {maxCreditScore}
          </h4>
        </div>
      </div>
    </div>
  )
}

export default HousingCard