import { NavLink } from "react-router-dom"

export const NavBar = () => {
    return (
        <div className="navbar">
            <nav>
                <div className="flex flex-col items-center bg-white p-6">
                {/* Logo Image */}
                <div className="logo">
                    <img src="https://via.placeholder.com/150" alt="Logo" />
                </div>
                <ul className="flex items-center space-x-4">
                    <li><NavLink to="/" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Home</NavLink></li>
                    <li><NavLink to="/about" className={({ isActive }) => isActive ? "text-light-blue" : ""}>About</NavLink></li>
                    <li><NavLink to="/wildlife" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Wildlife</NavLink></li>
                    <li><NavLink to="/checklists" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Checklists</NavLink></li>
                    <li><NavLink to="/resources" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Resources</NavLink></li>
                    <li><NavLink to="/contact" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Contact</NavLink></li>
                    <li><NavLink to="/api" className={({ isActive }) => isActive ? "text-light-blue" : ""}>API Test</NavLink></li>
                </ul>
                </div>
            </nav>
        </div>
    )
}