import HousingCard from "./HousingCard"

type Loan = {
  product_id: string
  product_name: string
  loan_type: string
  term_months: number
  interest_rate: number
  apr: number
  min_credit_score: number
  max_credit_score: number
  product_link: string
  institution: {
    institution_name: string
  }
}

type HousingGridProps = {
  loans: Loan[]
}

function HousingGrid({ loans }: HousingGridProps) {
  return (
    <div className="housing-grid">
      {loans.map((loan) => (
        <HousingCard
          key={loan.product_id}
          productName={loan.product_name}
          lender={loan.institution.institution_name}
          loanType={loan.loan_type}
          termMonths={loan.term_months}
          interestRate={loan.interest_rate}
          apr={loan.apr}
          minCreditScore={loan.min_credit_score}
          maxCreditScore={loan.max_credit_score}
          productLink={loan.product_link}
        />
      ))}
    </div>
  )
}

export default HousingGrid