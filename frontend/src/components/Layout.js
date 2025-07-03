import { Footer } from "./Footer"
import { NavBar } from "./NavBar"

export const Layout = ({ children }) => {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  };