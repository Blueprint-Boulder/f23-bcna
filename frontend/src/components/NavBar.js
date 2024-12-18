import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
            <img src="/logo.png" alt="Logo" className="max-h-full" />
          </div>
          <ul className="flex items-center space-x-4">
            {/* Existing navigation links */}
            <li>
              <NavLink
                exact="true"
                to="/"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                About
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                Contact
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/resources"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                Resources
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
                to="/admin"
                className={`hover:text-light-blue transition-all duration-300`}
              >
                Admin
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};
