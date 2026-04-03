import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Pages importing
import { Layout, WildlifeLayout, DynamicDBRouter } from "./components/Layouts";

import WildlifeDetails from "./pages/WildlifeDetails";
import { About } from "./pages/About";
import { Resources } from "./pages/Resources";
import { Contact } from "./pages/Contact";
import { Glossary } from "./pages/Glossary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Layout wraps all children below
    children: [
      {
        index: true,
        element: <Navigate to="/butterflies" replace />
      },
      {
        path: ":category", // This will match 'butterflies', 'dragonflies', or 'wildflowers'
        element: <WildlifeLayout />,
        children: [
          {
            index: true,
            element: <DynamicDBRouter /> // A simple wrapper to show the right DB component
          },
          {
            path: ":wildlifeId",
            element: <WildlifeDetails />
          }
        ]
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "resources",
        element: <Resources />
      },
      {
        path: "contact",
        element: <Contact />
      },
      {
        path: "glossary",
        element: <Glossary />
      }
    ]
  }
]);

export const App = () => {
  return (
    <div className="App bg-sand-50">
      <RouterProvider router={router} />
    </div>
  );
};
