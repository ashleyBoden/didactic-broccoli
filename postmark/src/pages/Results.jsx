import { Link, useLocation } from 'react-router-dom'
import styles from './Results.module.css'
import { useEffect, useState } from 'react'


export default function Results({ criteria }) {

  const location = useLocation()
  const { postcode } = location.state
  const [locationData, setLocationData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`)
        const data = await response.json()

        if (data.status === 200) {
          setLocationData(data)
        } else {
          setError('Something went wrong. Please try again.')
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
      }
    }
    fetchLocation()
  }, [postcode])

  console.log(locationData)

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