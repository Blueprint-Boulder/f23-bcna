import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { NavBar } from "./NavBar";
import { useState } from "react";
import { AdminContext } from "../services/adminContext";

export const Layout = () => {
  const [admin, setAdmin] = useState(false);
  console.log("provider");

  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AdminContext.Provider>
  );
};

export const WildlifeLayout = () => <Outlet />;
