import { useState } from 'react'
import styles from './Home.module.css'
import { Link, useNavigate } from 'react-router-dom'

export default function Home({ criteria }) {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    navigate('/results', { state: { postcode: searchTerm}})
  }

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>UK POSTCODE SCORING</p>
      <h1 className={styles.heading}>Find your perfect postcode</h1>
      <p className={styles.subheading}>Score any postcode on the things that matter to you — house prices, crime, and how long you'll spend getting to work.</p>
      
      <div className={styles.searchBar}>
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a postcode..."
        />
        <button onClick={handleSearch}>Score it</button>
      </div>

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