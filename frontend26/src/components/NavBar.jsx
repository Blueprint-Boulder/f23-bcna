import { NavLink } from "react-router-dom";
import search_icon from './icons/search_icon.png';

export const NavBar = () => {
  return (
    <nav className={`navbar font-roboto py-4`}>
        <ul className="flex items-center">

          {/* Logo Image */}
          <li className="ml-32 mr-[91px]">
            <NavLink to="/">
              <img src="/logo.png" alt="Logo" className="h-[76px] w-[307px]"/>
            </NavLink>
          </li>

          {/* Navigation links */}
          <li className="text-xl text-gray-500 space-x-[49px]">
            <NavLink to="/" className={`hover:text-light-blue transition-all duration-300`}>Home</NavLink>
            <NavLink to="/about" className={`hover:text-light-blue transition-all duration-300`}>About</NavLink>
            <NavLink to="/contact" className={`hover:text-light-blue transition-all duration-300`}>Contact</NavLink>
            <NavLink to="/resources" className={`hover:text-light-blue transition-all duration-300`}>Resources</NavLink>
            <NavLink to="/wildlife" className={`hover:text-light-blue transition-all duration-300`}>Wildlife</NavLink>
            <NavLink to="/admin" className={`hover:text-light-blue transition-all duration-300`}>Admin</NavLink>
          </li>

          {/* Search icon */}
          <li className="ml-[94px]">
            <img 
              src={search_icon}
              alt="search icon" 
              className="h-[16px] opacity-60"/>
          </li> 
        </ul>
    </nav>
  );
};
