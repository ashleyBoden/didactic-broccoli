import { Link, useLocation } from 'react-router-dom'
import styles from './Results.module.css'
import { useEffect, useState } from 'react'
import { calculateScores } from '../utils/scoring'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

function getLast5Years() {
  const currentYear = new Date().getFullYear()
  return [
    currentYear - 4,
    currentYear - 3,
    currentYear - 2,
    currentYear - 1, 
    currentYear
  ]
}

function getPriceSummary ( vsUKAverage, priceChange ) {
  const affordability = vsUKAverage < -50000 
    ? 'significantly more affordable than the UK average' 
    : vsUKAverage < 0
    ? 'below the UK average'
    : vsUKAverage < 50000
    ? 'close to the UK average'
    : 'above the UK average'

  const trend = priceChange > 5
    ? 'with strong price growth over the past few years'
    : priceChange > 0 
    ? 'with modest price growth'
    : 'with prices remaining flat or declining'

  return `${affordability.charAt(0).toUpperCase() + affordability.slice(1)}, ${trend}.`
}

const years = getLast5Years()

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
  const [showPriceTrend, setShowPriceTrend] = useState(false)
  const [animate, setAnimate] = useState(false)


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

        const overpassQuery = `
          [out:json];
          (
            node["railway"="station"](around:3000,${latitude},${longitude});
            node["railway"="halt"](around:3000,${latitude},${longitude});
            node["railway"="tram_stop"](around:3000,${latitude},${longitude});
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

        // Transport - separate so it doesn't block everything else
        let nearbyStations = null
        let hasTram = null

        try {
          const transportRes = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery
          })
          const transportJson = await transportRes.json()
          
          const stations = transportJson.elements.filter(e => 
            e.tags.railway === 'station' || e.tags.railway === 'halt'
          )
          const tramStops = transportJson.elements.filter(e => 
            e.tags.railway === 'tram_stop'
          )

          nearbyStations = stations.length
          hasTram = tramStops.length > 0

        } catch {
          console.log('Transport data unavailable')
        }

        const crimeJson = await crimeRes.json()
        const priceJsonByYear = await Promise.all(priceResByYear.map(r => r.json()))
        
        const noPriceByYear = priceJsonByYear.every(year => year.result.items.length === 0)

        if (noPriceByYear) {
          const town = postcodeData.result.admin_district.toUpperCase()
          const fallbackResults = await Promise.all(
            years.map(year => 
              fetch(`https://landregistry.data.gov.uk/data/ppi/transaction-record.json?propertyAddress.town=${town}&min-transactionDate=${year}-01-01&max-transactionDate=${year}-12-31&_page=0&_pageSize=50`)
            )
          )
          const fallbackJsonByYear = await Promise.all(fallbackResults.map(r => r.json()))
          setPriceData(fallbackJsonByYear)
        } else {
          setPriceData(priceJsonByYear)
        }

        setCrimeData(crimeJson)
        setCommuteData({
          nearestCity,
          distanceMiles,
          nearbyStations,
          hasTram
        })

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

    //12 month price change
  const currentPrice = priceByYear?.findLast(price => price !== null)
  const previousPrice = priceByYear?.slice(0, -1).findLast(price => price !== null)
  const priceChange = currentPrice && previousPrice ?
    ((currentPrice - previousPrice) / previousPrice * 100).toFixed(1) : null

   //vs UK Median
  const currentUKMedianPrice = 285000
  const vsUKAverage = currentPrice ? currentPrice - currentUKMedianPrice : null
  const vsUKAverageFormatted = vsUKAverage === null ? null
  : vsUKAverage >= 0
    ? `+£${vsUKAverage.toLocaleString()}` 
    : `-£${Math.abs(vsUKAverage).toLocaleString()}`

    //Most common property type
  const allTransactions = priceData ? priceData.flatMap(yearData => yearData.result.items || []) : []
  const mostCommonType = getMostCommonType(allTransactions)

    //Price trend graph
  const maxPrice = priceByYear ? Math.max(...priceByYear.filter(p => p !== null)) : 0
  const priceChartData = years.map((year, index) => ({
    year: year.toString(),
    price: priceByYear?.[index] ?? null
  })).filter(d => d.price !== null)

    //National rank
  const rank = locationData?.result.index_of_multiple_deprivation
  
  const scores = currentPrice && total && commuteData && rank
    ? calculateScores({
        currentPrice,
        priceChange: parseFloat(priceChange),
        total: total,
        distanceMiles: commuteData.distanceMiles,
        deprivationRank: rank
      }, criteria)
    : null

    // loading
  const isLoading = !locationData || !crimeData || !priceData  || !commuteData

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setAnimate(true), 100)
    }
  }, [isLoading])

  function scorePillClass(score) {
    if (!score) return ''
    if (score >= 7) return styles.scorePillHigh
    if (score >= 4) return styles.scorePillMid
    if(score == 0.0) return styles.scorePillLow
    return styles.scorePillLow
  }

  function scoreDotClass(score) {
    if (!score) return ''
    if (score >= 7) return styles.scoreDotHigh
    if (score >= 4) return styles.scoreDotMid
    return styles.scoreDotLow
  }

  return (
    <main className={styles.main}>

        {error && <p className={styles.error}>{error}</p>}        

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Scoring your postcode...</p>
          </div>
        ) : (
          <>
            <Link className={styles.back} to="/">
                New search
            </Link>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <p className={styles.postcode}>{formatPostcode(postcode)}</p>
                <p className={styles.location}>{locationData ? `${locationData.result.admin_ward}, ${locationData.result.admin_district}` : 'Loading...'}</p>
              </div>

              <div className={styles.headerRight}>
                <svg width="200" height="200" viewBox="0 0 120 120">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#0D9488" strokeWidth="8"
                    strokeDasharray="339.3"
                    strokeDashoffset={animate 
                      ? 339.3 * (1 - (scores?.overallScore ?? 0) / 10)
                      : 339.3
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    filter="url(#glow)"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                  <text x="60" y="53" textAnchor="middle" dominantBaseline="central" 
                    fill="#FFFFFF" fontSize="35" fontWeight="700" fontFamily="Outfit, sans-serif">
                      {scores ? scores.overallScore.toFixed(1) : '—'}
                  </text>
                  <text x="60" y="80" textAnchor="middle" dominantBaseline="central"
                    fill="#888892" fontSize="12" fontFamily="Outfit, sans-serif">
                      / 10
                  </text>
                </svg>
                <p className={styles.scoreName}>POSTMARK SCORE</p>
              </div>
          
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardTitle}>House prices</p>
                  <p className={styles.cardSource}>HM Land Registry · {locationData?.result.admin_ward} area</p>
                </div>
                <div className={`${styles.scorePill} ${scorePillClass(scores?.housePricesScore)}`}>
                  <span className={` ${styles.scoreDot} ${scoreDotClass(scores?.housePricesScore)}`}></span>
                  <span>{scores ? scores.housePricesScore.toFixed(1) : '—'}</span>
                </div>
              </div>

              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                    style={{ width: animate ? `${scores?.housePricesScore * 10}%` : '0%' }}
                  ></div>
              </div>

              <p className={styles.cardSummary}>
                {vsUKAverage !== null ? getPriceSummary(vsUKAverage, parseFloat(priceChange)) : ''}
              </p>

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

              <button 
                className={styles.trendToggle}
                onClick={() => setShowPriceTrend(!showPriceTrend)}
              >
                Trend {showPriceTrend ? '▲' : '▼'}
              </button>

              {showPriceTrend && (
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceChartData} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
                      <XAxis dataKey="year" stroke="#888892" tick={{ fill: '#888892', fontSize: 12 }} />
                      <YAxis hide={true} domain={['dataMin - 10000', 'dataMax + 10000']} />
                      <Tooltip 
                        formatter={(value) => [`£${value.toLocaleString()}`, 'Median price']}
                        contentStyle={{ background: '#222226', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                        labelStyle={{ color: '#888892' }}
                        itemStyle={{ color: '#F5F4F0' }}
                      />
                      <Line 
                        type="linear" 
                        dataKey="price" 
                        stroke="#0D9488" 
                        strokeWidth={2}
                        dot={{ fill: '#0D9488', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardTitle}>Crime rate</p>
                  <p className={styles.cardSource}>Police.uk · {formatMonth(crimeData?.[0]?.month)}</p>
                </div>
                <div className={`${styles.scorePill} ${scorePillClass(scores?.crimeScore)}`}>
                  <span className={` ${styles.scoreDot} ${scoreDotClass(scores?.crimeScore)}`}></span>
                  <span>{scores ? scores.crimeScore.toFixed(1) : '—'}</span>
                </div>
              </div>

              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                    style={{ width: animate ? `${scores?.crimeScore * 10}%` : '0%' }}
                  ></div>
              </div>

              <div className={styles.stats}>
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
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardTitle}>Commute time</p>
                  <p className={styles.cardSource}>OpenStreetMap · Nearby transport</p>
                </div>
                <div className={`${styles.scorePill} ${scorePillClass(scores?.commuteScore)}`}>
                  <span className={` ${styles.scoreDot} ${scoreDotClass(scores?.commuteScore)}`}></span>
                  <span>{scores ? scores.commuteScore.toFixed(1) : '—'}</span>
                </div>
              </div>

              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                    style={{ width: animate ? `${scores?.commuteScore * 10}%` : '0%' }}
                  ></div>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>Nearest city</p>
                  <p className={styles.statValue}>{`${commuteData?.nearestCity} · ${commuteData.distanceMiles} mi`|| 'Loading...'}</p>
                </div>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>Tram access</p>
                  <p className={styles.statValue}>
                    {commuteData?.hasTram === null ? '—' : commuteData?.hasTram ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>Train Stations &lt; 3 miles</p>
                  <p className={styles.statValue}>
                    {commuteData?.nearbyStations === null ? '—' : commuteData?.nearbyStations}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardTitle}>Deprivation index</p>
                  <p className={styles.cardSource}>ONS · IMD 2019</p>
                </div>
                <div className={`${styles.scorePill} ${scorePillClass(scores?.deprivationScore)}`}>
                  <span className={` ${styles.scoreDot} ${scoreDotClass(scores?.deprivationScore)}`}></span>
                  <span>{scores ? scores.deprivationScore.toFixed(1) : '—'}</span>
                </div>
              </div>

              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                    style={{ width: animate ? `${scores?.deprivationScore * 10}%` : '0%' }}
                  ></div>
              </div>

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
          </>
        )
      }
    </main>
  )
}