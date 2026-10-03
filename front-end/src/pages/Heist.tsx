import HousingGrid from "../components/HousingGrid"
import { useState } from 'react'

function Heist() {
    const [sortOption, setSortOption] = useState('apr-low')

    const sortedLoans = [...loans].sort((a, b) => {
        if (sortOption === 'apr-low') {
        return a.apr - b.apr
        }

        return b.apr - a.apr
    })
  return (

    <div>
        <div className="query-container">
            <div className="sort-container">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}>
                    <option value="apr-low">APR Lowest</option>
                    <option value="apr-high">APR Highest</option>
                </select>
            </div>
            <div className="filter-dropdown">
                <label htmlFor="filter">Filter by:</label>
                <select id="filter" name="filter">
                    <option value="veterans">Veterans</option>
                    <option value="lowIncome">Low Income</option>
                </select>
            </div>
            <div className="search-container">
                <input type="text" placeholder="Search by Lender or Loan..." />
                <button>Search</button>
            </div>
        </div>
        <HousingGrid loans={sortedLoans}/>
    </div>
  )
}

const loans = [
  {
    loanName: 'VA Home Loan',
    lender: 'USAA',
    apr: 6.125,
    veteransEligible: true,
    lowIncomeEligible: false,
  },

  {
    loanName: 'FHA Home Loan',
    lender: 'Rocket Mortgage',
    apr: 6.45,
    veteransEligible: false,
    lowIncomeEligible: true,
  },

  {
    loanName: 'Conventional 30-Year',
    lender: 'Bank of America',
    apr: 6.75,
    veteransEligible: false,
    lowIncomeEligible: false,
  },

  {
    loanName: 'USDA Home Loan',
    lender: 'Wells Fargo',
    apr: 6.25,
    veteransEligible: false,
    lowIncomeEligible: true,
  },
]


export default Heist