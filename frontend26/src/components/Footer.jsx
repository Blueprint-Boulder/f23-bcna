import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AdminContext } from "../services/adminContext";
import { AdminLogin } from "./AdminLogin";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const Footer = () => {
  const { admin, logout } = useContext(AdminContext);
  const [showLogin, setShowLogin] = useState(false);

  const linkUnderlineStyles = "relative w-fit font-serif text-[1.1rem] text-sand-700 transition-colors duration-300 hover:text-sand-900 group";
  const underlineSpan = "absolute left-1/2 bottom-0 w-0 h-[1px] bg-sand-500 transition-all duration-300 group-hover:w-full group-hover:left-0";

  return (
    <footer className="w-full py-12 px-6 border-t text-sand-600 bg-sand-100 border-sand-200">
      <div className="max-w-[1100px] mx-auto">
        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          
          {/* Logo & Info Section */}
          <div className="flex flex-col gap-4 min-w-[280px]">
            <a href="https://bcna.org/" target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity hover:opacity-80">
              <img src="/bcna-logo.png" alt="BCNA Logo" className="h-24 w-auto" />
            </a>
            <div>
              <p className="font-bold text-sand-800 tracking-wider text-sm mb-1 uppercase">
                Boulder County Nature Association
              </p>
              <p className="text-sand-500 text-sm">P.O. Box 493, Boulder, CO 80306</p>
            </div>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/BoulderCountyNatureAssociation" target="_blank" rel="noopener noreferrer" className="text-sand-400 hover:text-sand-700 transition-colors" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://www.instagram.com/bouldernatue" target="_blank" rel="noopener noreferrer" className="text-sand-400 hover:text-sand-700 transition-colors" aria-label="Instagram">
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            <div className="flex flex-col gap-2">
              <h5 className="text-sand-400 text-xs font-bold tracking-[0.1em] uppercase mb-2">Pages</h5>
              {['wildlife', 'glossary', 'about', 'resources', 'contact'].map((page) => (
                <Link 
                  key={page}
                  to={`/${page === 'wildlife' ? 'butterflies' : page}`} 
                  onClick={scrollToTop} 
                  className={linkUnderlineStyles}
                >
                  {page}
                  <span className={underlineSpan} />
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <h5 className="text-sand-400 text-xs font-bold tracking-[0.1em] uppercase mb-2">Links</h5>
              <a 
                href="https://bcna.org/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={linkUnderlineStyles}
              >
                main website
                <span className={underlineSpan} />
              </a>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="max-w-xs">
            <h5 className="text-sand-400 text-xs font-bold tracking-[0.1em] uppercase mb-4">Our Mission</h5>
            <p className="font-serif text-lg text-sand-700 leading-relaxed italic">
              "To conserve resilient natural ecosystems in our region through science, education, and advocacy."
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-10 border-sand-200" />

        {/* Legal & Credits Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-wide text-sand-500 uppercase">
          <p>
            © 2026{" "}
            <a href="https://bcna.org/" target="_blank" rel="noopener noreferrer" className="hover:text-sand-800 transition-colors">
              Boulder County Nature Association
            </a>
          </p>
          
          <div className="flex items-center gap-6">
            <p>
              Site by{" "}
              <a href="https://blueprintboulder.org/" target="_blank" rel="noopener noreferrer" className="hover:text-sand-800 transition-colors font-semibold">
                Blueprint Boulder
              </a>
            </p>
            
            <span className="hidden md:block h-3 w-[1px] bg-sand-300"></span>

            {admin ? (
              <button onClick={logout} className="hover:text-sand-800 transition-colors uppercase">
                Log out
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="hover:text-sand-800 transition-colors uppercase">
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>
      {showLogin && <AdminLogin onClose={() => setShowLogin(false)} />}
    </footer>
  );
};