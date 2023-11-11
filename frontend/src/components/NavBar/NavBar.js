import { Link } from "react-router-dom"

export const NavBar = () => {
    return (
        <div className="navbar">
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/wildlife">Wildlife</Link></li>
                    <li><Link to="/checklists">Checklists</Link></li>
                    <li><Link to="/resources">Resources</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                    <li><Link to="/api">API Test</Link></li>
                </ul>
            </nav>
        </div>
    )
}