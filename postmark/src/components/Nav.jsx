import { Link } from "react-router-dom";
import styles from "./Nav.module.css";

export default function Nav() {
  return (
      <nav className={styles.nav}>
        <div className={styles.home}>
            <Link to="/">
                <svg width="22" height="22" viewBox="0 0 22 22">
                    <circle cx="11" cy="11" r="10" fill="none" stroke="#4169E1" strokeWidth="2"/>
                    <circle cx="11" cy="11" r="4" fill="none" stroke="#4169E1" strokeWidth="1.5"/>
                </svg>
                Postmark
            </Link>
        </div>
        <ul className={styles.navList}>          
          <li className={styles.navItem}><Link to="/">How it works</Link></li>
          <li className={styles.navItem}><Link to="/">About</Link></li>
        </ul>
    </nav>
  )
}