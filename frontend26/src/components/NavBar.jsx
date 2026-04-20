/**
 * Navigation bar for the BCNA wildlife site.
 * Displays the current dataset link, site switching menu, admin controls, and page navigation links.
 */
import { useParams, Link, NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { AdminContext } from "../services/adminContext";
import { AdminLogin } from "./AdminLogin";

// Sites defines the dataset home pages shown in the dropdown menu.
// Each entry includes a slug, route path, logo, and hover background styling.
const sites = [
  { id: 'butterflies', path: '/', logo: '/butterfly-logo.png', label: 'Butterflies', hoverBg: 'hover:bg-[#e2f2e7]'},
  { id: 'dragonflies', path: '/dragonflies', logo: '/dragonfly-logo.png', label: 'Dragonflies', hoverBg: 'hover:bg-blue-50' },
  { id: 'wildflowers', path: '/wildflowers', logo: '/wildflower-logo.png', label: 'Wildflowers', hoverBg: 'hover:bg-orange-50' },
];
//Links
const navLinks = [
  { name: "About", path: "/about" },
  { name: "Resources", path: "/resources" },
  { name: "Glossary", path: "/glossary" },
  { name: "Contact", path: "/contact" },
];

export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { category } = useParams();
  // currentSite is the dataset currently selected via the URL param.
  const currentSite = sites.find(s => s.id === category) || sites[0];
  // otherSites are shown in the hover dropdown to switch between datasets.
  const otherSites = sites.filter(s => s.id !== category);

  const { admin, logout } = useContext(AdminContext);
  const [showLogin, setShowLogin] = useState(false);


  return (
    <>
      {admin && (
        <div
          className="p-2 font-bold text-center text-white bg-pink-700 cursor-pointer"
          onClick={logout}
        >
          You are currently in admin mode.
        </div>
      )}
      <nav className={`flex items-center justify-between px-4.25 py-1.5 h-27.5 bg-sand-50 relative`}>
        
        {/* Left side - Logo and Site Switcher */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <div className="flex items-center cursor-pointer">
            <Link 
              to={currentSite.path} 
              className={`w-78 h-24.5 flex items-center ${currentSite.hoverBg} rounded-xl relative md:w-78 md:h-24.5 sm:w-50 sm:h-15`}
            >
              <img src={currentSite.logo} alt={currentSite.label} className="w-75 h-24.5 object-cover md:w-75 md:h-24.5 sm:w-45 sm:h-15"/>

              <ChevronDown
                size={24}
                strokeWidth={1.75}
                className={`text-sand-400 transition-all duration-300 -ml-2.5 md:block hidden ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </Link>
          </div>

          {/* Dropdown Menu - Desktop */}
          {isMenuOpen && (
            <div className="absolute top-24.5 left-0 w-87.5 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-40 flex flex-col hidden md:flex">
              {otherSites.map((site) => (
                <Link 
                  key={site.id}
                  to={site.path} 
                  className={`group/item flex items-center justify-between h-28.5 w-83.5 ${site.hoverBg} py-2 rounded-xl transition-colors`}
                >
                  <img 
                    src={site.logo}
                    alt={site.label}
                    className="h-24.5 object-contain" 
                  />
                  
                  <ChevronRight 
                    className="text-sand-400 -ml-2.5 opacity-0 transition-all duration-300 group-hover/item:opacity-100 z-50" 
                    size={24}
                    strokeWidth={1.75}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      
        {/* Right side - Desktop Navigation */}
        <div className="hidden md:flex items-center gap-9 px-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className="relative font-sans text-xl font-regular text-sand-400 transition-colors duration-300 hover:text-sand-500 group"
            >
              {link.name}
              <span className="absolute left-1/2 bottom-0 w-0 h-[1.5px] bg-sand-500 transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-sand-400 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
            {/* Mobile Site Switcher */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col space-y-2">
                {otherSites.map((site) => (
                  <Link
                    key={site.id}
                    to={site.path}
                    className={`flex items-center justify-left h-28.5 w-full ${site.hoverBg} py-2 rounded-xl transition-colors`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <img
                      src={site.logo}
                      alt={site.label}
                      className="h-24.5 object-contain"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="p-4">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className="text-sand-600 font-medium py-2 px-3 rounded-lg hover:bg-sand-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
