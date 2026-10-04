import HousingGrid from "../components/HousingGrid"
import { useEffect, useState } from 'react'


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
    institution_type: string
    institution_link: string
  }
}

function Heist() {
    const [sortOption, setSortOption] = useState('apr-low')
    const [loans, setLoans] = useState<Loan[]>([])

    useEffect(() => {
    fetch("http://localhost:3000/api/loan-products")
        .then((response) => response.json())
        .then((rows) => {
            setLoans(rows)
        })
        .catch((error) => {
            console.error("Failed to fetch loans:", error)
        })
}, [])

    const sortedLoans = [...loans].sort((a, b) => {
        if (sortOption === 'apr-low') {
        return Number(a.apr) - Number(b.apr)
        }

        return Number(b.apr) - Number(a.apr)
    })
  return (

    <div className="heist-page">
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


export default Heist