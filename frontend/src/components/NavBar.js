import { NavLink } from "react-router-dom"
import { useState } from "react"

export const NavBar = () => {

    const[expanded, setExpanded] = useState(false)
    const [linkStyles, setLinkStyles] = useState("hidden md:flex md:items-center md:space-x-4")

    function toggleExpand() {
        if(expanded === false){
            setExpanded(!expanded)
            return "block md:flex md:items-center md:space-x-4"
        }
        else{
            setExpanded(!expanded)
            return "hidden md:flex md:items-center md:space-x-4"
        }
    }

    return (
        <div className="navbar">
            <nav>
                <div className="flex md:flex-col gap-8 justify-center items-center bg-white p-6">
                    {/* Logo Image */}
                    <div className="logo">
                        <img src="https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/04/cfrb_logo4.jpg" alt="Logo" className="w-96 h-auto mb-2"/>
                    </div>
                    <button onClick={() => setLinkStyles(toggleExpand())} className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                        </svg>
                    </button>
                    <ul className={linkStyles} id="links">
                        <li><NavLink to="/" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Home</NavLink></li>
                        <li><NavLink to="/about" className={({ isActive }) => isActive ? "text-light-blue" : ""}>About</NavLink></li>
                        <li><NavLink to="/wildlife" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Wildlife</NavLink></li>
                        <li><NavLink to="/checklists" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Checklists</NavLink></li>
                        <li><NavLink to="/resources" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Resources</NavLink></li>
                        <li><NavLink to="/contact" className={({ isActive }) => isActive ? "text-light-blue" : ""}>Contact</NavLink></li>
                        <li><NavLink to="/api" className={({ isActive }) => isActive ? "text-light-blue" : ""}>API</NavLink></li>
                    </ul>
                </div>
            </nav>
        </div>
    )
}