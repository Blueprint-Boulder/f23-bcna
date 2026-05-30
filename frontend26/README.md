# BCNA Wildlife Database Frontend

This is the React frontend for the Boulder County Nature Association (BCNA) wildlife database application. It provides a searchable, filterable interface for exploring local wildlife including butterflies, dragonflies, and wildflowers.

## Features

- **Searchable Database**: Search through wildlife entries by name
- **Advanced Filtering**: Filter by taxonomic family and genus
- **Responsive Design**: Mobile-friendly interface with collapsible filters
- **Admin Panel**: Administrative interface for adding/editing wildlife entries
- **Image Gallery**: Display wildlife photos with thumbnails
- **Multi-Dataset Support**: Support for multiple wildlife datasets

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library

## Development

### Prerequisites

- **Python 3.12 or higher** (the script will check this)
- **Node.js (v20 LTS recommended)** with npm (the script will check this)

### Running the Full Application

The easiest way to run both frontend and backend together is using the `run_website.py` script from the project root:

```bash
# From the project root directory
python run_website.py
```

This script will:
- Check for required prerequisites (Python 3.12+, npm)
- Create a Python virtual environment (if needed)
- Install/update Python dependencies from `backend/requirements.txt`
- Create a `.env` file with default configuration (if missing)
- Start the Flask backend server on `http://localhost:5001`
- Install Node.js dependencies (if needed)
- Start the Vite development server on `http://localhost:3000`

The application will be available at `http://localhost:3000`.

**For new users**: The script handles all setup automatically. Just ensure Python 3.12+ and Node.js are installed on your system.

### Individual Development (Alternative)

If you prefer to run frontend and backend separately:

#### Frontend Only

```bash
npm install
npm run dev
```

The development server will start on `http://localhost:5173` (Vite's default port).

#### Backend Only

See the main project README in the root directory for backend setup instructions.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ActionButton.jsx
│   ├── AdminLogin.jsx
│   ├── FilterBar.jsx
│   ├── Footer.jsx
│   ├── Layouts.jsx
│   ├── NavBar.jsx
│   ├── SearchBar.jsx
│   └── icons/
├── data/
│   └── glossaryTerms.json
├── pages/               # Page components
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── Glossary.jsx
│   ├── Resources.jsx
│   ├── WildlifeDetails.jsx
│   └── WildlifeDBs/     # Database-specific pages
│       ├── ButterflyDB.jsx
│       ├── DragonflyDB.jsx
│       ├── TemplateDB.jsx
│       └── WildlifeDB.jsx
├── services/
│   ├── adminContext.jsx
│   └── apiService.js
└── main.jsx            # App entry point
```

## Creating a New Wildlife Database

The application supports multiple wildlife datasets. To add a new database (e.g., for birds, mammals, etc.), follow these steps:

### Backend Setup

1. **Create Dataset Folder**: In the `data/` directory (at the project root), create a new folder for your dataset:
   ```bash
   mkdir ../data/birds
   mkdir ../data/birds/uploaded_images
   ```

2. **Database Initialization**: The backend will automatically discover the new dataset folder and create the SQLite database with the proper schema when the application starts.

### Frontend Setup

1. **Create Database Component**: Create a new component in `src/pages/WildlifeDBs/` following the pattern of `TemplateDB.jsx`:

   ```jsx
   // BirdDB.jsx
   import { WildlifeDB } from "./WildlifeDB";

   export function BirdDB() {
     return (
       <WildlifeDB
         type="birds"                    // Dataset name (matches folder name)
         label="Bird"                   // Singular label for UI
         heroImage="/bird-hero.jpg"     // Hero image path
         heroPosition="50% 50%"         // Background position
         title={                        // Hero title (can include JSX)
           <>Explore the <br /> Birds of <br /> Colorado's <br /> Front Range</>
         }
       />
     );
   }
   ```

2. **Add Route**: Update the routing configuration to include the new database page. Check `src/App.jsx` or the routing setup to add the new route.

3. **Add Navigation**: Update navigation components (like `NavBar.jsx`) to include links to the new database.

4. **Hero Image**: Add the hero image referenced in the component to the `public/` directory.

### Key Points

- The `type` prop must match the dataset folder name (normalized to lowercase with underscores)
- The backend auto-discovers datasets by scanning the `data/` directory
- Each dataset gets its own SQLite database file
- The `WildlifeDB` component handles all the common functionality (search, filtering, display)
- Images are stored in `uploaded_images/` subfolders within each dataset directory

## API Integration

The frontend communicates with a Flask backend API. Key endpoints include:

- `GET /api/wildlife?dataset={type}` - Fetch all wildlife entries
- `GET /api/get-image-by-image-id/{id}?dataset={type}` - Get wildlife images
- `POST /api/auth/login` - Admin authentication

See `src/services/apiService.js` for the complete API integration.

## Contributing

1. Follow the existing code patterns and component structure
2. Use Tailwind CSS classes for styling
3. Ensure responsive design works on mobile devices
4. Test with multiple datasets to ensure compatibility
5. Run the linter before committing: `npm run lint`
