import { useParams, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useContext } from "react";
import { AdminContext } from "../services/adminContext";

//Sites
const sites = [
  //UPDATE COLORS
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
  const { category, wildlifeId } = useParams();
  const currentSite = sites.find(s => s.id === category) || sites[0];
  const otherSites = sites.filter(s => s.id !== category);

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
      <nav className={`flex items-center justify-between px-[17px] py-[6px] h-[110px] bg-sand-50`}>
        
        {/* Left side */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <div className="flex items-center cursor-pointer">
            <Link 
              to={currentSite.path} 
              className={`w-[312px] h-[98px] flex items-center ${currentSite.hoverBg} rounded-xl relative`}
            >
              <img src={currentSite.logo} alt={currentSite.label} className="w-[300px] h-[98px] object-cover"/>

              <ChevronDown
                size={24}
                strokeWidth={1.75}
                className={`text-sand-400 transition-all duration-300 ml-[-10px] ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </Link>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-[98px] left-0 w-[350px] bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-40 flex flex-col">
              {otherSites.map((site) => (
                <Link 
                  key={site.id}
                  to={site.path} 
                  className={`group/item flex items-center justify-between h-[114px] w-[334px] ${site.hoverBg} py-2 rounded-xl transition-colors`}
                >
                  <img 
                    src={site.logo}
                    alt={site.label}
                    className="h-[98px] object-contain" 
                  />
                  
                  <ChevronRight 
                    className="text-sand-400 ml-[-10px] opacity-0 transition-all duration-300 group-hover/item:opacity-100 z-50" 
                    size={24}
                    strokeWidth={1.75}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      
        {/* Right side */}
        <div className="flex items-center gap-[36px] px-3">
          <button className={`font-sans text-xl font-regular transition-colors duration-200 text-sand-400 hover:underline hover: decoration-1`} onClick={() => setAdmin(!admin)}>
            Admin
          </button>
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `font-sans text-xl font-regular transition-colors duration-200 text-sand-400 hover:underline hover: decoration-1`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};
