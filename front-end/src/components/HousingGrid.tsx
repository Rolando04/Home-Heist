import HousingCard from "./HousingCard"

type Loan = {
  loanName: string
  lender: string
  apr: number
  veteransEligible: boolean
  lowIncomeEligible: boolean
}

type HousingGridProps = {
  loans: Loan[]
}

function HousingGrid({ loans }: HousingGridProps) {
    return (
<div className="housing-grid">
      {loans.map((loan) => (
    <HousingCard
      LoanName={loan.loanName}
      lender={loan.lender}
      apr={loan.apr}
      veteransEligible={loan.veteransEligible}
      lowIncomeEligible={loan.lowIncomeEligible}
    />
  ))}
</div>
    )
}

export default HousingGrid
