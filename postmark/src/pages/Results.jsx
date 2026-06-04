import { Link, useLocation } from 'react-router-dom'
import styles from './Results.module.css'
import { useEffect, useState } from 'react'


  //property data processing functions
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

function getMostCommonType(items) {
  if (!items || items.length === 0)
    return null

  const tally = {}
  
  items.forEach(item => {
    const type = item.propertyType.prefLabel[0]._value
    tally[type] = (tally[type] || 0) + 1
  })

  const mostCommon = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0]
  return mostCommon
}

  //Crime data processing functions
function formatCategory(category) {
  const withSpaces = category.replace(/-/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

function processCrimeData(items) {
  if (!items || items.length === 0)
    return null

  const total = items.length
  
  const tally = {}
  items.forEach(item => {
    const category = item.category
    tally[category] = (tally[category] || 0) + 1
  })
  const mostCommonCategory = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0]

  const uniqueMonths = new Set(items.map(crime => crime.month))
  const perMonth = Math.round(total / uniqueMonths.size)

  return {
    total, 
    mostCommonCategory
  }
}

function formatMonth(monthStr) {
  if (!monthStr) return null

  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

  //Commute time functions
const CITY_CENTRES = {
  'London': { lat: 51.5074, lng: -0.1278 },
  'Manchester': { lat: 53.4808, lng: -2.2426 },
  'Birmingham': { lat: 52.4862, lng: -1.8904 },
  'Leeds': { lat: 53.8008, lng: -1.5491 },
  'Sheffield': { lat: 53.3811, lng: -1.4701 },
  'Bristol': { lat: 51.4545, lng: -2.5879 },
  'Edinburgh': { lat: 55.9533, lng: -3.1883 },
  'Glasgow': { lat: 55.8642, lng: -4.2518 },
  'Liverpool': { lat: 53.4084, lng: -2.9916 },
  'Newcastle': { lat: 54.9783, lng: -1.6178 },
  'Nottingham': { lat: 52.9548, lng: -1.1581 },
  'Cardiff': { lat: 51.4816, lng: -3.1791 },
  'Leicester': { lat: 52.6369, lng: -1.1398 },
  'Coventry': { lat: 52.4068, lng: -1.5197 },
  'Bradford': { lat: 53.7960, lng: -1.7594 },
  'Hull': { lat: 53.7676, lng: -0.3274 },
  'Stoke': { lat: 53.0027, lng: -2.1794 },
  'Derby': { lat: 52.9225, lng: -1.4746 },
  'Southampton': { lat: 50.9097, lng: -1.4044 },
  'Portsmouth': { lat: 50.8198, lng: -1.0880 },
  'Norwich': { lat: 52.6309, lng: -1.2974 },
  'Oxford': { lat: 51.7520, lng: -1.2577 },
  'Cambridge': { lat: 52.2053, lng: 0.1218 },
  'Brighton': { lat: 50.8229, lng: -0.1363 },
  'Exeter': { lat: 50.7184, lng: -3.5339 },
  'Plymouth': { lat: 50.3755, lng: -4.1427 },
  'Swansea': { lat: 51.6214, lng: -3.9436 },
  'Aberdeen': { lat: 57.1497, lng: -2.0943 },
  'Dundee': { lat: 56.4620, lng: -2.9707 },
  'Belfast': { lat: 54.5973, lng: -5.9301 },
  'Middlesbrough': { lat: 54.5742, lng: -1.2350 },
  'Sunderland': { lat: 54.9069, lng: -1.3838 },
}

function straightLineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function compareDistances(a, b) {
  return a.distance - b.distance
}

function findNearestCity(lat, lng) {
  const withDistances = Object.entries(CITY_CENTRES).map(([name, coords]) => ({
    name, 
    distance: straightLineDistance(lat, lng, coords.lat, coords.lng)
  }))

  const sorted = withDistances.sort(compareDistances)
  return sorted[0].name
}


export default function Results({ criteria }) {

  const location = useLocation()
  const { postcode } = location.state
  const [locationData, setLocationData] = useState(null)
  const [error, setError] = useState(null)
  const [priceData, setPriceData] = useState(null)
  const [crimeData, setCrimeData] = useState(null)
  const crimeStats = crimeData ? processCrimeData(crimeData) : null
  const { total, mostCommonCategory } = crimeStats || {} //Crime data
  const [commuteData, setCommuteData] = useState(null)


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

        const locality = postcodeData.result.admin_ward.toUpperCase()

        const { latitude, longitude } = postcodeData.result

        const nearestCity = findNearestCity(latitude, longitude)
        const cityCoords = CITY_CENTRES[nearestCity]
        const distanceKm = straightLineDistance(latitude, longitude, cityCoords.lat, cityCoords.lng)
        const distanceMiles = Math.round(distanceKm * 0.621371)

        setCommuteData({
          nearestCity,
          distanceMiles
        })     
     
        const years = [2021, 2022, 2023, 2024, 2025]

        const overpassQuery = `
          [out:json];
          (
            node["railway"="station"](around:3000,${latitude},${longitude});
            node["railway"="halt"](around:3000,${latitude},${longitude});
          );
          out;
        `
        //Land registry and Crime data APIs
        const [crimeRes, ...priceResByYear] = await Promise.all([
          fetch(`https://data.police.uk/api/crimes-street/all-crime?lat=${latitude}&lng=${longitude}`),
          ...years.map(year =>
            fetch(`https://landregistry.data.gov.uk/data/ppi/transaction-record.json?propertyAddress.locality=${locality}&min-transactionDate=${year}-01-01&max-transactionDate=${year}-12-31&_page=0&_pageSize=50`)
          )
        ])

        // Stations - separate so it doesn't block everything else
        let nearbyStations = 0
        try {
          const stationRes = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery
        })
        const stationsJson = await stationRes.json()
        nearbyStations = stationsJson.elements.length
        console.log('stations:', stationsJson.elements.map(s => s.tags.name))
        } catch {
          console.log('Stations data unavailable')
        }

        const crimeJson = await crimeRes.json()
        const priceJsonByYear = await Promise.all(priceResByYear.map(r => r.json()))        

        setCrimeData(crimeJson)
        setPriceData(priceJsonByYear)
        setCommuteData({
          nearestCity,
          distanceMiles,
          nearbyStations
        })

        console.log(crimeJson)
        

      } catch (err) {
        console.error('fetchAll error: ', err)
        setError('Something went wrong. Please try again.')
    }
  }

  fetchAll()
}, [postcode])
  
    //House median price
  const priceByYear = priceData ? priceData.map(yearData =>
    processYearData(yearData.result.items)
  ) : null

    //12 year price change
  const currentPrice = priceByYear?.findLast(price => price !== null)
  const currentUKMedianPrice = 285000
  const vsUKAverage = currentPrice - currentUKMedianPrice
  const vsUKAverageFormatted = vsUKAverage >= 0
    ? `+£${vsUKAverage.toLocaleString()}` 
    : `-£${Math.abs(vsUKAverage).toLocaleString()}`

    //Most common property type
  const allTransactions = priceData ? priceData.flatMap(yearData => yearData.result.items || []) : []
  const mostCommonType = getMostCommonType(allTransactions)

    //National rank
  const rank = locationData?.result.index_of_multiple_deprivation
  


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
              <p className={styles.cardSource}>HM Land Registry · {locationData?.result.admin_ward} area</p>
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
              <p className={styles.statValue}>{currentPrice ? `£${currentPrice.toLocaleString()}` : 'No data'}</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>vs UK Median</p>
              <p className={styles.statValue}>{vsUKAverageFormatted || 'No data'}</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Most common type</p>
              <p className={styles.statValue}>{mostCommonType || 'No data'}</p>
            </div>
          </div>          

          <button className={styles.trendToggle}>Trend</button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardTitle}>Crime rate</p>
              <p className={styles.cardSource}>Police.uk · {formatMonth(crimeData?.[0]?.month)}</p>
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
              <p className={styles.statLabel}>Total crime for the month</p>
              <p className={styles.statValue}>{total ? total : null}</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Data period</p>
              <p className={styles.statValue}>{formatMonth(crimeData?.[0]?.month)}</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Most common</p>
              <p className={styles.statValue}>{mostCommonCategory ? formatCategory(mostCommonCategory) : 'No data'}</p>
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
              <p className={styles.statLabel}>Nearest city</p>
              <p className={styles.statValue}>{commuteData?.nearestCity || 'Loading...'}</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Distance to {commuteData?.nearestCity}</p>
              <p className={styles.statValue}>{commuteData ? `${commuteData.distanceMiles} miles` : 'Loading...'}</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Train Stations &lt; 3 miles</p>
              <p className={styles.statValue}>{commuteData !== null ? commuteData.nearbyStations : 'Loading...'}</p>
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
              <p className={styles.statValue}>{rank ? Math.ceil((rank / 32844) * 10) : null}</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>National rank</p>
              <p className={styles.statValue}>{rank ? rank : null} out of 32,844</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Parliamentary constituency</p>
              <p className={styles.statValue}>{locationData ? locationData.result.parliamentary_constituency_2024 : null}</p>
            </div>
          </div>
        </div>
    </main>
  )
}