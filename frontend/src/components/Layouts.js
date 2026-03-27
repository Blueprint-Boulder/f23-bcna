import { Outlet } from "react-router-dom";
import { Footer } from "./Footer"
import { NavBar } from "./NavBar"

export const Layout = () => {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  };

export const WildlifeLayout = () => <Outlet />;