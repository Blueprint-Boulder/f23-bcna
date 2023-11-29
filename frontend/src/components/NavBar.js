import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 0)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className={`navbar p-6`}>
      <nav>
        <div className="flex flex-col items-center">
          {/* Logo Image */}
          <div
            className={`logo ${
              isScrolled ? "h-18" : "h-28"
            } transition-all duration-300`}
          >
            <img
              src="https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/04/cfrb_logo4.jpg"
              alt="Logo"
              className="max-h-full"
            />
          </div>
          <ul className="flex items-center space-x-4">
            <li>
              <NavLink
                exact
                to="/"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/wildlife"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                Wildlife
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/api"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                API
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}
