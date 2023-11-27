
import "./navbarstyle.css"
import { Link, useMatch, useResolvedPath } from "react-router-dom" ;



export default function Navbar() {
    return <nav className="nav">
        <Link to="/" className="site-title" >Cinematd</Link>
        <ul>
            <CustomLink to="/home">Home</CustomLink>
            <CustomLink to="/films">Films</CustomLink>
            <CustomLink to="/profile">Profile</CustomLink>

        </ul>
    </nav>
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  )
}