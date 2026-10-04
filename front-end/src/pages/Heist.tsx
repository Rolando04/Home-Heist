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
    const [hunting, setHunting] = useState(false)
    const [recommendation, setRecommendation] = useState('')

    const fetchLoans = () => {
    fetch("http://localhost:3000/api/loan-products")
        .then((response) => response.json())
        .then((rows) => {
            setLoans(rows)
        })
        .catch((error) => {
            console.error("Failed to fetch loans:", error)
        })
    }

    useEffect(() => {
        fetchLoans()
    }, [])

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        setHunting(true)
        setRecommendation('')
        try {
            const res = await fetch("http://localhost:3001/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zip: form.get("zip"),
                    creditScore: Number(form.get("creditScore")),
                    income: Number(form.get("income")),
                    propertyPrice: Number(form.get("propertyPrice")),
                    downPayment: Number(form.get("downPayment")),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setRecommendation(data.recommendation)
        } catch (error) {
            console.error("Agent search failed:", error)
        } finally {
            setHunting(false)
            fetchLoans()
        }
    }

    const sortedLoans = [...loans].sort((a, b) => {
        if (sortOption === 'apr-low') {
        return Number(a.apr) - Number(b.apr)
        }

        return Number(b.apr) - Number(a.apr)
    })
  return (

    <div className="heist-page">
        <form className="profile-form" onSubmit={handleProfileSubmit}>
            <h3>Find rates for you</h3>
            <div className="profile-fields">
                <input name="zip" placeholder="ZIP code" required />
                <input name="creditScore" type="number" placeholder="Credit score" required />
                <input name="income" type="number" placeholder="Annual income" required />
                <input name="propertyPrice" type="number" placeholder="Home price" required />
                <input name="downPayment" type="number" placeholder="Down payment" required />
                <button type="submit" disabled={hunting}>
                    {hunting ? "Cracking the vault..." : "Heist my rates"}
                </button>
            </div>
        </form>
        {recommendation && (
            <div className="recommendation-card">
                <h3>Your Heist Plan</h3>
                <pre>{recommendation}</pre>
            </div>
        )}
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