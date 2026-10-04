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
        <h4>
          <span>Interest Rate</span>
          <span>{Number(interestRate).toFixed(2)}%</span>
        </h4>

        <h4>
          <span>Loan Type</span>
          <span>{loanType ?? "Unknown"}</span>
        </h4>

        <h4>
          <span>Term</span>
          <span>{termMonths != null ? `${termMonths / 12} Years` : "Unknown"}</span>
        </h4>

        <h4>
          <span>Credit Score</span>
          <span>
            {minCreditScore != null && maxCreditScore != null
              ? `${minCreditScore} - ${maxCreditScore}`
              : "Unknown"}
          </span>
        </h4>
      </div>
    </div>
  )
}

export default HousingCard