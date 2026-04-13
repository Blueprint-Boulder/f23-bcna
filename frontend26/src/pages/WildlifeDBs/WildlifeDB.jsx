import { useState, useEffect, useContext, useMemo } from "react";
import { AdminContext } from "../../services/adminContext";
import { NavLink } from "react-router-dom";
import apiService from "../../services/apiService";

function AddCard({ wildlifeType, label }) {
  return (
    <NavLink
      className="group flex flex-col w-full sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] rounded-lg overflow-hidden border-2 border-dashed border-pink-200 bg-pink-50/30 hover:bg-pink-50 transition-all duration-200"
      to={`/${wildlifeType}/new`}
    >
      <div className="aspect-square flex items-center justify-center">
        <div className="text-pink-300 text-6xl font-light group-hover:scale-110 transition-transform">+</div>
      </div>
      <div className="p-3 bg-white border-t border-pink-100">
        <p className="font-serif text-sm font-semibold text-pink-700">Add {label}</p>
        <p className="font-serif italic text-pink-400 text-xs mt-0.5">New entry</p>
      </div>
    </NavLink>
  );
}

function Result({ wildlifeType, id, name, sub, image }) {
  return (
    <NavLink
      className="group flex flex-col w-full sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] rounded-lg overflow-hidden border border-sand-200 bg-white hover:shadow-lg transition-shadow duration-200"
      to={`/${wildlifeType}/${id}`}
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

function FamilyFilter({ family, genera, openFamilies, setOpenFamilies, selectedFamilies, toggleFamily, selectedGenera, toggleGenus }) {
  const isOpen = openFamilies.has(family);
  const isFamilyChecked = selectedFamilies.has(family);

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
        <input
          type="checkbox"
          className="accent-sand-400 w-3.5 h-3.5 shrink-0"
          checked={isFamilyChecked}
          onChange={() => toggleFamily(family)}
          onClick={e => e.stopPropagation()}
        />
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
              <input
                type="checkbox"
                className="accent-sand-400 w-3.5 h-3.5 shrink-0 not-italic"
                checked={selectedGenera.has(genus)}
                onChange={() => toggleGenus(genus)}
              />
              {genus}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function WildlifeDB({ type, label, heroImage, heroPosition = "50% 50%", title }) {
  const [search, setSearch] = useState("");
  const [wildlife, setWildlife] = useState([]);
  const [openFamilies, setOpenFamilies] = useState(new Set());
  const [selectedFamilies, setSelectedFamilies] = useState(new Set());
  const [selectedGenera, setSelectedGenera] = useState(new Set());
  const { admin } = useContext(AdminContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getAllWildlife(type);
        setWildlife(Object.values(data));
      } catch (error) {
        console.error("Error fetching wildlife data:", error);
      }
    };
    fetchData();
  }, [type]);

  // Build a map of family -> Set of genera from field_values
  const familyMap = useMemo(() => {
    const map = new Map();
    for (const w of wildlife) {
      const familyField = (w.field_values || []).find(fv => fv.name.toLowerCase() === "family");
      const familyName = familyField ? familyField.value : null;
      if (!familyName) continue;
      if (!map.has(familyName)) map.set(familyName, new Set());
      const genus = w.scientific_name ? w.scientific_name.split(" ")[0] : null;
      if (genus) map.get(familyName).add(genus);
    }
    return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }, [wildlife]);

  const toggleFamily = (family) =>
    setSelectedFamilies(prev => {
      const next = new Set(prev);
      next.has(family) ? next.delete(family) : next.add(family);
      return next;
    });

  const toggleGenus = (genus) =>
    setSelectedGenera(prev => {
      const next = new Set(prev);
      next.has(genus) ? next.delete(genus) : next.add(genus);
      return next;
    });

  const hasFilters = selectedFamilies.size > 0 || selectedGenera.size > 0;

  const filtered = wildlife.filter(w => {
    if (!w.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (!hasFilters) return true;
    const familyField = (w.field_values || []).find(fv => fv.name.toLowerCase() === "family");
    const familyName = familyField ? familyField.value : null;
    const genus = w.scientific_name ? w.scientific_name.split(" ")[0] : null;
    if (selectedGenera.size > 0 && genus && selectedGenera.has(genus)) return true;
    if (selectedFamilies.size > 0 && familyName && selectedFamilies.has(familyName)) return true;
    return false;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative h-130 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url('${heroImage}')`,
            backgroundPosition: heroPosition,
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 flex h-full items-center px-[8%]">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-wide leading-none text-shadow-[2px_2px_8px_rgba(0,0,0,1)] text-sand-50">
              {title}
            </h2>
            <p className="font-[playfair-display] ml-20 lg:ml-50 mt-2 italic text-gray-200">
              by BCNA nature photo display
            </p>
          </div>
        </div>
      </section>

      <div className="p-5">
        <div className="flex max-w-[1500px] mx-auto gap-5">
          {/* Sidebar */}
          <aside className="w-[280px] shrink-0 p-5 rounded border border-sand-200 bg-sand-100 h-max font-['Playfair_Display']">
            <h5 className="font-['Montserrat',sans-serif] text-sand-300 text-xs font-semibold tracking-widest uppercase mb-5 ml-2">
              Filters
            </h5>
            {[...familyMap.entries()].map(([family, genera]) => (
              <FamilyFilter
                key={family}
                family={family}
                genera={genera}
                openFamilies={openFamilies}
                setOpenFamilies={setOpenFamilies}
                selectedFamilies={selectedFamilies}
                toggleFamily={toggleFamily}
                selectedGenera={selectedGenera}
                toggleGenus={toggleGenus}
              />
            ))}
          </aside>

          {/* Main content */}
          <main className="w-full min-w-0">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${wildlife.length.toLocaleString()} ${type}…`}
              className="w-full font-['Playfair_Display'] bg-white px-3 py-2.5 text-xl rounded border border-sand-200 placeholder:text-sand-200 placeholder:italic outline-none focus:ring-2 focus:ring-sand-400 focus:ring-opacity-30"
            />

            <div className="flex flex-wrap gap-5 mt-5">
              {admin && <AddCard wildlifeType={type} label={label} />}
              {filtered.slice(0, 20).map(w => (
                <Result
                  key={w.id}
                  wildlifeType={type}
                  id={w.id}
                  name={w.name}
                  sub={w.scientific_name}
                  image={w.thumbnail_id}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="font-['Playfair_Display'] italic text-sand-400 mt-10 text-center">
                No {type} found for "{search}"
              </p>
            )}
          </main>
        </div>
      </div>
    </>
  );
}