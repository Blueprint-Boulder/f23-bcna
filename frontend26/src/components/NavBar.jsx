import { NavLink } from "react-router-dom";
import search_icon from "./icons/search_icon.png";
import { useContext } from "react";
import { AdminContext } from "../services/adminContext";

export const NavBar = () => {
  const { admin, setAdmin } = useContext(AdminContext);

  return (
    <>
      {admin && (
        <div
          className="p-2 font-bold text-center text-white bg-pink-700 cursor-pointer"
          onClick={() => setAdmin(false)}
        >
          You are currently in admin mode. Click here to exit.
        </div>
      )}
      <nav className={`navbar font-roboto py-4`}>
        <ul className="flex items-center">
          {/* Logo Image */}
          <li className="ml-32 mr-[91px]">
            <NavLink to="/">
              <img src="/logo.png" alt="Logo" className="h-[76px] w-[307px]" />
            </NavLink>
          </li>

          {/* Navigation links */}
          <li className="text-xl text-gray-500 space-x-[49px]">
            <NavLink to="/" className={`hover:text-light-blue transition-all duration-300`}>
              Home
            </NavLink>
            <NavLink to="/about" className={`hover:text-light-blue transition-all duration-300`}>
              About
            </NavLink>
            <NavLink to="/contact" className={`hover:text-light-blue transition-all duration-300`}>
              Contact
            </NavLink>
            <NavLink to="/resources" className={`hover:text-light-blue transition-all duration-300`}>
              Resources
            </NavLink>
            <NavLink to="/wildlife" className={`hover:text-light-blue transition-all duration-300`}>
              Wildlife
            </NavLink>
            <button className={`hover:text-light-blue transition-all duration-300`} onClick={() => setAdmin(!admin)}>
              Admin
            </button>
          </li>

          {/* Search icon */}
          <li className="ml-[94px]">
            <img src={search_icon} alt="search icon" className="h-[16px] opacity-60" />
          </li>
        </ul>
      </nav>
    </>
  );
};
