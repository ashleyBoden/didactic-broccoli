import { Link, useLocation } from 'react-router-dom'
import styles from './Results.module.css'
import { useEffect, useState } from 'react'

function formatPostcode(raw) {
  const clean = raw.replace(/\s+/g, '').toUpperCase()
  return clean.slice(0, -3) + ' ' + clean.slice(-3)
}

function processYearData(items) {
  if (!items || items.length === 0) 
    return null 

  const prices = items.map(item => item.pricePaid).sort((a, b) => a - b)
  const median = Math.floor(prices.length / 2)
  return prices[median]
}

export default function Results({ criteria }) {

  const location = useLocation()
  const { postcode } = location.state
  const [locationData, setLocationData] = useState(null)
  const [error, setError] = useState(null)
  const [priceData, setPriceData] = useState(null)
  const [crimeData, setCrimeData] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {

        const postcodeRes = await fetch(`https://api.postcodes.io/postcodes/${postcode}`)
        const postcodeData = await postcodeRes.json()

        if (postcodeData.status !== 200) {
          setError('Postcode not found. Please check and try again.')
          return
        }

        setLocationData(postcodeData)

        const { latitude, longitude } = postcodeData.result
     
        const years = [2021, 2022, 2023, 2024, 2025]

        const [crimeRes, ...priceResByYear] = await Promise.all([
          fetch(`https://data.police.uk/api/crimes-street/all-crime?lat=${latitude}&lng=${longitude}`),
          ...years.map(year =>
            fetch(`https://landregistry.data.gov.uk/data/ppi/transaction-record.json?propertyAddress.postcode=${formatPostcode(postcode)}&min-transactionDate=${year}-01-01&max-transactionDate=${year}-12-31&_page=0&_pageSize=50`)
          )
        ])

        const crimeJson = await crimeRes.json()
        const priceJsonByYear = await Promise.all(priceResByYear.map(r => r.json()))

        setCrimeData(crimeJson)
        setPriceData(priceJsonByYear)

        console.log('prices by year:', priceJsonByYear)

      } catch (err) {
        setError('Something went wrong. Please try again.')
    }
  }

  fetchAll()
}, [postcode])


  console.log('location:', locationData)
  console.log('crime:', crimeData)
  console.log('price:', priceData)
  
  const priceByYear = priceData ? priceData.map(yearData =>
    processYearData(yearData.result.items)
  ) : null

  console.log('price by year: ', priceByYear)

  return (
    <main className={styles.main}>

        {error && <p className={styles.error}>{error}</p>}

        <Link className={styles.back} to="/">
        New search
        </Link>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.postcode}>{postcode}</p>
            <p className={styles.location}>{locationData ? `${locationData.result.admin_ward}, ${locationData.result.admin_district}` : 'Loading...'}</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.scoreCircle}>
              <p className={styles.scoreNumber}>7.4</p>
              <p className={styles.scoreLabel}>/ 10</p>
            </div>
            <p className={styles.scoreName}>POSTMARK SCORE</p>
          </div>
          
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>House prices</p>
              <p className={styles.cardSource}>HM Land Registry · Apr 2026</p>
            </div>
            <div className={styles.scorePill}>
              <span className={styles.scoreDot}></span>
              <span>6.2</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '62%' }}></div>
          </div>

          <p className={styles.cardSummary}>Above the Manchester average, but stable and well-supported by demand.</p>

          <div className={`${styles.stats} ${styles.statsWithBorder}`}>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Median sold price</p>
              <p className={styles.statValue}>£372,500</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>12-month change</p>
              <p className={styles.statValue}>+4.2%</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Price per sq ft</p>
              <p className={styles.statValue}>£372</p>
            </div>
          </div>          

          <button className={styles.trendToggle}>Trend</button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>Crime rate</p>
              <p className={styles.cardSource}>Police.uk · rolling 12 mo</p>
            </div>
            <div className={styles.scorePill}>
              <span className={styles.scoreDot}></span>
              <span>7.0</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '70%' }}></div>
          </div>

          <p className={styles.cardSummary}>Lower than most of inner Manchester. Vehicle crime is the main category.</p>

          <div className={`${styles.stats} ${styles.statsWithBorder}`}>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Crimes per 1,000</p>
              <p className={styles.statValue}>62</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>vs city average</p>
              <p className={styles.statValue}>-23%</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Most common</p>
              <p className={styles.statValue}>Vehicle crime</p>
            </div>
          </div>          

          <button className={styles.trendToggle}>Trend</button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>Commute time</p>
              <p className={styles.cardSource}>TfGM · National Rail</p>
            </div>
            <div className={styles.scorePill}>
              <span className={styles.scoreDot}></span>
              <span>8.6</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '86%' }}></div>
          </div>

          <p className={styles.cardSummary}>Fast, frequent links into the city centre on both Metrolink and rail.</p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <p className={styles.statLabel}>To city centre</p>
              <p className={styles.statValue}>24 min</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Modes</p>
              <p className={styles.statValue}>Metrolink + rail</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Stations &lt; 1 mile</p>
              <p className={styles.statValue}>6</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>Deprivation index</p>
              <p className={styles.cardSource}>ONS · IMD 2019</p>
            </div>
            <div className={styles.scorePill}>
              <span className={styles.scoreDot}></span>
              <span>5.1</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '51%' }}></div>
          </div>

          <p className={styles.cardSummary}>Mid-range deprivation. Some variation within the postcode district.</p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <p className={styles.statLabel}>IMD decile</p>
              <p className={styles.statValue}>5</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>National rank</p>
              <p className={styles.statValue}>14,203</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Region rank</p>
              <p className={styles.statValue}>3,847</p>
            </div>
          </div>
        </div>
    </main>
  )
}