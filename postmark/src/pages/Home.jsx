import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <main>
      <p>UK POSTCODE SCORING</p>
      <h1>Find your perfect postcode</h1>
      <p>Score any postcode on the things that matter to you — house prices, crime, and how long you'll spend getting to work.</p>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter a postcode..."
      />
      <button onClick={() => console.log(searchTerm)}>Score it</button>
      <button onClick={() => setSearchTerm('M20')}>M20</button>
      <button onClick={() => setSearchTerm('SW1A')}>SW1A</button>
      <button onClick={() => setSearchTerm('EH1')}>EH1</button>
      <Link to="/criteria">Set your criteria</Link>
    </main> 
  ) 
}