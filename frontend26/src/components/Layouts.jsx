import { Outlet, useParams } from "react-router-dom";
import { Footer } from "./Footer";
import { NavBar } from "./NavBar";
import { ButterflyDB } from "../pages/WildlifeDBs/ButterflyDB";
import { DragonflyDB } from "../pages/WildlifeDBs/DragonflyDB";
import { WildflowerDB } from "../pages/WildlifeDBs/WildflowerDB";

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

export const DynamicDBRouter = () => {
  const { category } = useParams();

  // Map the URL string to your specific components
  const components = {
    butterflies: <ButterflyDB />,
    dragonflies: <DragonflyDB />,
    wildflowers: <WildflowerDB />,
  };

  // Return the correct component, or a 404/Fallback if the category doesn't exist
  return components[category] || <div className="p-10">Category not found.</div>;
}