import { 
  createBrowserRouter,
  RouterProvider,
  Navigate 
} from 'react-router-dom';

// Pages importing
import { Layout, WildlifeLayout } from './components/Layouts';
import { ButterflyDB  } from './pages/WildlifeDBs/ButterflyDB';
import { DragonflyDB  } from './pages/WildlifeDBs/DragonflyDB';
import { WildflowerDB  } from './pages/WildlifeDBs/WildflowerDB';

import WildlifeDetails from './pages/WildlifeDetails';
import { About } from './pages/About';
import { Resources } from './pages/Resources';
import { Contact } from './pages/Contact';
import { Glossary } from './pages/Glossary';

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
        path: "butterflies",
        element: <WildlifeLayout />,
        children: [
          {
            index: true,
            element: <ButterflyDB />
          },
          {
            path: ":wildlifeId",
            element: <WildlifeDetails />
          }
        ]
      },
      {
        path: "dragonflies",
        element: <WildlifeLayout />,
        children: [
          {
            index: true,
            element: <DragonflyDB />
          },
          {
            path: ":wildlifeId",
            element: <WildlifeDetails />
          }
        ]
      },
      {
        path: "wildflowers",
        element: <WildlifeLayout />,
        children: [
          {
            index: true,
            element: <WildflowerDB />
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
      },
    ],
  },
]);

export const App = () => {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}

