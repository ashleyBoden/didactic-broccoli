import { useEffect, useState } from 'react'
import styles from './Home.module.css'
import { Link, useNavigate } from 'react-router-dom'

export default function Home({ criteria }) {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearch = () => {
    navigate('/results', { state: { postcode: searchTerm}})
  }

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }
      const res = await fetch(`https://api.postcodes.io/postcodes/${searchTerm}/autocomplete`)
      const data = await res.json()
      setSuggestions(data.result || [])

      if (data.result == searchTerm) {
        setShowSuggestions(false)
      } else {
        setShowSuggestions(true)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])


  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>UK POSTCODE SCORING</p>
      <h1 className={styles.heading}>Find your perfect postcode</h1>
      <p className={styles.subheading}>Score any postcode on the things that matter to you — house prices, crime, and how long you'll spend getting to work.</p>
      
      
      <form className={styles.searchBar} onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a postcode..."
        />
        <button type="submit">Score it</button>
        
        {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.slice(0, 3).map(postcode => (
          <li key={postcode} onClick={() => {
            setSearchTerm(postcode)
            setShowSuggestions(false)
          }}>
            {postcode}
          </li>
          ))}
        </ul>
        )}
      </form>

      

      <div className={styles.pills}>
        <p className={styles.suggestion}>Try:</p>
        <button onClick={() => setSearchTerm('M20')}>M20</button>
        <button onClick={() => setSearchTerm('SW1A')}>SW1A</button>
        <button onClick={() => setSearchTerm('EH1')}>EH1</button>
      </div>

      <div className={styles.criteria}>
        <Link to="/criteria">Set your criteria</Link>
      </div>
    </main> 
  ) 
}