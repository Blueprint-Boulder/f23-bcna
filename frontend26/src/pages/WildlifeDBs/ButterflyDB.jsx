import { useState, useRef, useEffect } from "react";
import apiService from "../../services/apiService";
import { NavLink } from "react-router-dom";

function Result({ id, name, sub, image }) {
  return (
    <NavLink
      to={`/butterflies/${id + 1}`}
      className="group flex flex-col w-[calc(50%-8px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] rounded-lg overflow-hidden border border-sand-200 bg-white hover:shadow-lg transition-shadow duration-200"
    >
      <div className="overflow-hidden aspect-square bg-sand-100">
        {image ? (
          <img
            src={`http://127.0.0.1:5000/api/get-image-by-image-id/${image}`}
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
        <p className="font-serif text-sm font-semibold leading-tight truncate text-sand-600">{name}</p>
        <p className="font-serif italic text-sand-400 text-xs mt-0.5 truncate">{sub}</p>
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
        <span className="font-serif text-sm">{family}</span>
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
              className="flex items-center gap-2 cursor-pointer text-sand-400 italic font-serif text-sm hover:bg-sand-200 rounded px-1 py-0.5 transition-colors select-none"
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesAndFields = await apiService.getCategoriesAndFields();
        const data = await apiService.getAllWildlife();

        const fetchedWildlife = convertDataToArray(data);
        const fetchedCategories = convertDataToArray(categoriesAndFields.categories);

        setButterflies(fetchedWildlife); // Set the updated data with image URLs
        // setFamilies(fetchedCategories);
      } catch (error) {
        console.error("Error fetching wildlife data:", error);
      }
    };

    fetchData();
  }, []);

  const filtered = butterflies.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5">
      <div className="flex max-w-[1500px] mx-auto gap-5">
        {/* ── Sidebar filters ── */}
        <aside className="w-[280px] shrink-0 p-5 rounded border border-sand-200 bg-sand-100 h-max font-serif">
          <h5 className="mb-5 ml-2 text-xs font-semibold tracking-widest uppercase text-sand-300">Filters</h5>

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
            className="w-full font-serif bg-white px-3 py-2.5 text-xl rounded border border-sand-200 placeholder:text-sand-200 placeholder:italic outline-none focus:ring-2 focus:ring-sand-400 focus:ring-opacity-30"
          />

          <div className="flex flex-wrap gap-5 mt-5">
            {filtered.slice(0, 20).map((butterfly, i) => (
              <Result
                key={i}
                id={i}
                name={butterfly.name}
                sub={butterfly.scientific_name}
                image={butterfly.thumbnail_id}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 font-serif italic text-center text-sand-400">No butterflies found for "{search}"</p>
          )}
        </main>
      </div>
    </div>
  );
}
