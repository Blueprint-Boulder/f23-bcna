import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom"
import apiService from "../../services/apiService";

function Result({ wildlifeType, id, name, sub, image }) {
  return (
    <NavLink 
      className="group flex flex-col w-full sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] rounded-lg overflow-hidden border border-sand-200 bg-white hover:shadow-lg transition-shadow duration-200"
      to={`/${wildlifeType}/${id + 1}`}
    >
      <div className="overflow-hidden aspect-square bg-sand-100">
        {image ? (
          <img
            src={`http://127.0.0.1:5000/api/get-image-by-image-id/${image}?dataset=${wildlifeType}`}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-sand-200">
            <svg viewBox="0 0 64 64" className="w-16 h-16 opacity-30" fill="currentColor">
              <path d="M32 8c-4 0-8 4-8 12 0 4 1.5 7.5 4 10-8-2-16 2-16 10 0 6 5 10 12 10 4 0 7-2 8-4 1 2 4 4 8 4 7 0 12-4 12-10 0-8-8-12-16-10 2.5-2.5 4-6 4-10 0-8-4-12-8-12z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-['Playfair_Display'] font-semibold text-sand-600 text-sm leading-tight truncate">{name}</p>
        <p className="font-['Playfair_Display'] italic text-sand-400 text-xs mt-0.5 truncate">{sub}</p>
      </div>
    </NavLink>
  );
}

function FamilyFilter({ family, genera, openFamilies, setOpenFamilies }) {
  const isOpen = openFamilies.has(family);

  const toggle = () =>
    setOpenFamilies(prev => {
      const next = new Set(prev);
      next.has(family) ? next.delete(family) : next.add(family);
      return next;
    });

  return (
    <div className="mb-2.5">
      {/* Family row */}
      <label
        className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer text-sand-600 hover:bg-sand-200 transition-colors select-none"
        onClick={toggle}
      >
        <input type="checkbox" className="accent-sand-400 w-3.5 h-3.5 shrink-0" onClick={e => e.stopPropagation()} />
        <span className="font-['Playfair_Display'] text-sm">{family}</span>
        <svg
          className={`ml-auto w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </label>

      {/* Genera list */}
      {isOpen && (
        <div className="ml-3.5 mt-2 pl-5 border-l border-sand-200 flex flex-col gap-2.5 pb-1">
          {[...genera].map(genus => (
            <label
              key={genus}
              className="flex items-center gap-2 cursor-pointer text-sand-400 italic font-['Playfair_Display'] text-sm hover:bg-sand-200 rounded px-1 py-0.5 transition-colors select-none"
            >
              <input type="checkbox" className="accent-sand-400 w-3.5 h-3.5 shrink-0 not-italic" />
              {genus}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const convertDataToArray = data => {
  return Object.keys(data).map(key => data[key]);
};

export function ButterflyDB() {
  const [search, setSearch] = useState("");
  const [openFamilies, setOpenFamilies] = useState(new Set());
  // const [families, setFamilies] = useState([]);
  const [butterflies, setButterflies] = useState([]);
  const [wildlifeType, setWildlifeType] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const type = "butterflies"; 
        setWildlifeType(type);

        const categoriesAndFields = await apiService.getCategoriesAndFields(type);
        const data = await apiService.getAllWildlife(type);

        const fetchedWildlife = convertDataToArray(data);
        // const fetchedCategories = convertDataToArray(categoriesAndFields.categories);
        
        setButterflies(fetchedWildlife);
      } catch (error) {
        console.error("Error fetching wildlife data:", error);
      }
    };

    fetchData();
  }, []);

  console.log({ butterflies });

  const filtered = butterflies.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {/* -- Hero -- */}
      <section className="relative h-130 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-position-[25%_65%] bg-no-repeat"
          style={{ 
            backgroundImage: `url('/butterfly-hero.png')`,
          }}
        >
          {/* dark overlay */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <div className="relative z-10 flex h-full items-center px-[8%]">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-wide leading-none text-shadow-[2px_2px_8px_rgba(0,0,0,1)] text-sand-50">
              Explore the <br /> 
              Butterflies of <br /> 
              Colorado's <br /> 
              Front Range
            </h2>
            <p className="font-[playfair-display] ml-20 lg:ml-50 mt-2 italic text-gray-200">
              by BCNA nature photo display
            </p>
          </div>
        </div>
      </section>
      <div className="p-5">
        <div className="flex max-w-[1500px] mx-auto gap-5">
          {/* ── Sidebar filters ── */}
          <aside className="w-[280px] shrink-0 p-5 rounded border border-sand-200 bg-sand-100 h-max font-['Playfair_Display']">
            <h5 className="font-['Montserrat',sans-serif] text-sand-300 text-xs font-semibold tracking-widest uppercase mb-5 ml-2">
              Filters
            </h5>

            {/* {[...families].map(([family, genera]) => (
              <FamilyFilter
                key={family}
                family={family}
                genera={genera}
                openFamilies={openFamilies}
                setOpenFamilies={setOpenFamilies}
              />
            ))} */}
          </aside>

          {/* ── Main content ── */}
          <main className="w-full min-w-0">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${butterflies.length.toLocaleString()} butterflies…`}
              className="w-full font-['Playfair_Display'] bg-white px-3 py-2.5 text-xl rounded border border-sand-200 placeholder:text-sand-200 placeholder:italic outline-none focus:ring-2 focus:ring-sand-400 focus:ring-opacity-30"
            />

            <div className="flex flex-wrap gap-5 mt-5">
              {filtered.slice(0, 20).map((butterfly, i) => (
                <Result
                  wildlifeType={wildlifeType}
                  key={i}
                  id={i}
                  name={butterfly.name}
                  sub={butterfly.scientific_name}
                  image={butterfly.thumbnail_id}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="font-['Playfair_Display'] italic text-sand-400 mt-10 text-center">
                No butterflies found for "{search}"
              </p>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
