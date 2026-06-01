import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Criteria.module.css'

function getWeightLabel(value) {
  if (value === 0) return 'Off'
  if (value <= 2) return 'Low'
  if (value === 3) return 'Medium'
  if (value === 4) return 'High'
  return 'Top'
}

export default function Criteria() {

  const [criteria, setCriteria] = useState({
  housePrices: 4,
  crimeRate: 3,
  commuteTime: 5,
  deprivation: 2
})

  return (
    <main className={styles.main}>

      <Link className={styles.back} to="/">
        Back
      </Link>

      <h1 className={styles.heading}>Set your criteria</h1>
      <p className={styles.subheading}>Drag to tell Postmark how much each factor matters. Higher weights pull the overall score toward that criterion.</p>

      <div className={styles.row}>
        <div className={styles.rowInfo}>
          <p className={styles.rowHeader}>House prices</p>
          <p className={styles.rowDescription}>Median sold price & 12-month trend</p>
        </div>
        <div className={styles.sliderWrapper}>
          <input 
            type="range"
            min="0"
            max="5"
            value={criteria.housePrices}
            onChange={e => setCriteria({ ...criteria, housePrices: Number(e.target.value) })}
        />
        </div>
        
        <div className={styles.rowValue}>
          <span>{criteria.housePrices}</span>
          <p>{getWeightLabel(criteria.housePrices)}</p>
        </div>
      </div>
      
      <div className={styles.row}>
        <div className={styles.rowInfo}>
          <p className={styles.rowHeader}>Crime rate</p>
          <p className={styles.rowDescription}>Recorded incidents per 1,000 residents</p>
        </div>
        <div className={styles.sliderWrapper}>
          <input
            type="range"
            min="0"
            max="5"
            value={criteria.crimeRate}
            onChange={e => setCriteria({ ...criteria, crimeRate: Number(e.target.value) })}
        />
        </div>
       
        <div className={styles.rowValue}>
          <span>{criteria.crimeRate}</span>
          <p>{getWeightLabel(criteria.crimeRate)}</p>
        </div>
      </div>
      
      <div className={styles.row}>
        <div className={styles.rowInfo}>
          <p className={styles.rowHeader}>Commute time</p>
          <p className={styles.rowDescription}>Door-to-centre journey, public transport</p>
        </div>
        <div className={styles.sliderWrapper}>
          <input
            type="range"
            min="0"
            max="5"
            value={criteria.commuteTime}
            onChange={e => setCriteria({ ...criteria, commuteTime: Number(e.target.value) })}
          />
        </div>
        <div className={styles.rowValue}>
          <span>{criteria.commuteTime}</span>
          <p>{getWeightLabel(criteria.commuteTime)}</p>
        </div>
      </div>
      
      <div className={styles.row}>
        <div className={styles.rowInfo}>
          <p className={styles.rowHeader}>Deprivation</p>
          <p className={styles.rowDescription}>Index of multiple deprivation decile</p>
        </div>
        <div className={styles.sliderWrapper}>
          <input
            type="range"
            min="0"
            max="5"
            value={criteria.deprivation}
            onChange={e => setCriteria({ ...criteria, deprivation: Number(e.target.value) })}
          />
        </div>
        <div className={styles.rowValue}>
          <span>{criteria.deprivation}</span>
          <p>{getWeightLabel(criteria.deprivation)}</p>
        </div>
      </div>
      

      <button className={styles.button} onClick={() => console.log(criteria)}>Search with these weights</button>
    </main>
  )
}