import { Link, useLocation } from 'react-router-dom'
import styles from './Results.module.css'


export default function Results({ criteria }) {

  const location = useLocation()
  const { postcode } = location.state

  return (
    <main>
        <Link className={styles.back} to="/">
        New search
        </Link>

        <p>{postcode}</p>

    </main>
  )
}