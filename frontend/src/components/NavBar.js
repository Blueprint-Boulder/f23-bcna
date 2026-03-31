import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";


export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  //Links
  const navLinks = [
    { name: "Admin", path: "/admin" },
    { name: "About", path: "/about" },
    { name: "Resources", path: "/resources" },
    { name: "Glossary", path: "/glossary" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className={`flex items-center justify-between px-[17px] py-[6px] h-[110px] bg-[#f4f9f4]`}>
      
      {/* Left side */}
      <div 
        className="relative group"
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        <div className="flex items-center cursor-pointer">
          <Link to="/" className="w-[312px] h-[98px] flex items-center hover:bg-[#e2f2e7] rounded-xl relative">
            <img src="/butterfly-logo.png" alt="Logo" className="w-[300px] h-[98px] object-cover"/>

            <ChevronDown
              size={24}
              strokeWidth={1.75}
              className={`text-[#6bb086] transition-all duration-300 ml-[-10px] ${
                isMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </Link>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-[98px] left-0 w-[350px] bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-40 flex flex-col">
            <Link 
              to="/dragonflies" 
              className="group/item flex items-center justify-between h-[114px] w-[334px] hover:bg-blue-50 py-2 rounded-xl transition-colors"
            >
              <img 
                src="/dragonfly-logo.png" 
                alt="Dragonflies" 
                className="h-[98px] object-contain" 
              />
              
              <ChevronRight 
                className="text-[#6bb086] ml-[-10px] opacity-0 transition-all duration-300 group-hover/item:opacity-100 z-50" 
                size={24}
                strokeWidth={1.75}
              />
            </Link>
            <Link to="/wildflowers" className="h-[114px] w-[334px] hover:bg-orange-50 py-2 rounded-xl transition-colors">
               <img src="/wildflower-logo.png" alt="Wildflowers" className="h-[98px] object-contain" />
            </Link>
          </div>
        )}
      </div>


      {/* Right side */}
      <div className="flex items-center gap-[36px] px-3">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `font-sans text-xl font-regular transition-colors duration-200 text-[#6bb086] hover:underline hover: decoration-1`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
