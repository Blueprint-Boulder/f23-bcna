/**
 * WildlifeDB renders a searchable catalog of wildlife items for a given dataset.
 * It includes a filter sidebar, searchable results, and an admin-only add card.
 * Uses FlexSearch to search across name, scientific_name, and all field_values.
 */
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { AdminContext } from "../../services/adminContext";
import { NavLink } from "react-router-dom";
import { Filter, X } from "lucide-react";
import FlexSearch from "flexsearch";
import apiService from "../../services/apiService";

// AddCard renders the admin-only card that links to the new wildlife entry form.
function AddCard({ wildlifeType, label }) {
  return (
    <NavLink
      className="group flex flex-col w-full sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] rounded-lg overflow-hidden border-2 border-dashed border-pink-200 bg-pink-50/30 hover:bg-pink-50 transition-all duration-200"
      to={`/${wildlifeType}/new`}
    >
      <div className="flex items-center justify-center aspect-square">
        <div className="text-6xl font-light text-pink-300 transition-transform group-hover:scale-110">+</div>
      </div>
      <div className="p-3 bg-white border-t border-pink-100">
        <p className="font-serif text-sm font-semibold text-pink-700">Add {label}</p>
        <p className="font-serif italic text-pink-400 text-xs mt-0.5">New entry</p>
      </div>
    </NavLink>
  );
}

// Result renders a single wildlife card in the database grid.
function Result({ wildlifeType, id, name, sub, image }) {
  return (
    <NavLink
      className="group flex flex-col w-full sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] rounded-lg overflow-hidden border border-sand-200 bg-white hover:shadow-lg transition-shadow duration-200"
      to={`/${wildlifeType}/${id}`}
    >
      <div className="overflow-hidden aspect-square bg-sand-100">
        {image ? (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/api/get-image-by-image-id/${image}?dataset=${wildlifeType}`}
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

// FamilyFilter renders a collapsible filter section for one taxonomic family.
function FamilyFilter({
  family,
  genera,
  openFamilies,
  setOpenFamilies,
  familyChecked,
  toggleFamily,
  selectedGenera,
  toggleGenus
}) {
  const isOpen = openFamilies.has(family);

  const toggle = () =>
    setOpenFamilies(prev => {
      const next = new Set(prev);
      next.has(family) ? next.delete(family) : next.add(family);
      return next;
    });

  return (
    <div className="mb-2.5">
      <label
        className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer text-sand-600 hover:bg-sand-200 transition-colors select-none"
        onClick={toggle}
      >
        <input
          type="checkbox"
          className="accent-sand-400 w-3.5 h-3.5 shrink-0"
          ref={el => {
            if (el) el.indeterminate = familyChecked === "indeterminate";
          }}
          checked={familyChecked === "checked"}
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

// Build a flat searchable string from a wildlife item's field values.
function buildFieldText(item) {
  if (!item.field_values?.length) return "";
  return item.field_values.map(fv => fv.value).join(" ");
}

export function WildlifeDB({ type, label, heroImage, heroPosition = "50% 50%", title }) {
  const [search, setSearch] = useState("");
  const [wildlife, setWildlife] = useState([]);
  const [openFamilies, setOpenFamilies] = useState(new Set());
  const [selectedGenera, setSelectedGenera] = useState(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { admin } = useContext(AdminContext);

  // FlexSearch document index — rebuilt whenever wildlife data changes.
  // We index three fields: name, scientific_name, and a flattened field_values string.
  const indexRef = useRef(null);

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

  // Rebuild the FlexSearch index whenever the wildlife array changes.
  useEffect(() => {
    const index = new FlexSearch.Document({
      tokenize: "forward",
      cache: 100,
      document: {
        id: "id",
        index: [
          { field: "name", tokenize: "forward", resolution: 9 },
          { field: "scientific_name", tokenize: "forward", resolution: 7 },
          { field: "field_text", tokenize: "forward", resolution: 5 }
        ]
      }
    });

    for (const w of wildlife) {
      index.add({
        id: w.id,
        name: w.name ?? "",
        scientific_name: w.scientific_name ?? "",
        field_text: buildFieldText(w)
      });
    }

    indexRef.current = index;
  }, [wildlife]);

  // Build a map of family -> Set of genera from field_values.
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

  const toggleFamily = family => {
    const genera = familyMap.get(family) || new Set();
    setSelectedGenera(prev => {
      const next = new Set(prev);
      const allChecked = genera.size > 0 && [...genera].every(g => next.has(g));
      if (allChecked) genera.forEach(g => next.delete(g));
      else genera.forEach(g => next.add(g));
      return next;
    });
  };

  const toggleGenus = genus =>
    setSelectedGenera(prev => {
      const next = new Set(prev);
      next.has(genus) ? next.delete(genus) : next.add(genus);
      return next;
    });

  const familyState = family => {
    const genera = familyMap.get(family) || new Set();
    if (genera.size === 0) return "unchecked";
    let count = 0;
    for (const g of genera) if (selectedGenera.has(g)) count++;
    if (count === 0) return "unchecked";
    if (count === genera.size) return "checked";
    return "indeterminate";
  };

  const hasFilters = selectedGenera.size > 0;

  // Apply FlexSearch and genus filters to produce the final result list.
  // When the search box is empty we skip the index lookup and use the full list.
  const filtered = useMemo(() => {
    let base = wildlife;

    if (search.trim() && indexRef.current) {
      // Search across all three indexed fields and union the matching IDs.
      const results = indexRef.current.search(search.trim(), { limit: 1000, enrich: false });
      const matchedIds = new Set(results.flatMap(r => r.result));
      base = wildlife.filter(w => matchedIds.has(w.id));
    }

    if (!hasFilters) return base;

    return base.filter(w => {
      const genus = w.scientific_name ? w.scientific_name.split(" ")[0] : null;
      return !!genus && selectedGenera.has(genus);
    });
  }, [search, wildlife, hasFilters, selectedGenera]);

  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden h-130">
        <div
          className="absolute inset-0 bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url('${heroImage}')`,
            backgroundPosition: heroPosition
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
        <div className="flex gap-5 mx-auto max-w-375">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden p-5 font-serif border rounded md:block w-70 shrink-0 border-sand-200 bg-sand-100 h-max">
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
                familyChecked={familyState(family)}
                toggleFamily={toggleFamily}
                selectedGenera={selectedGenera}
                toggleGenus={toggleGenus}
              />
            ))}
          </aside>

          {/* Main content */}
          <main className="w-full min-w-0">
            {/* Mobile Filter Button */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 font-medium transition-colors border rounded-lg bg-sand-100 border-sand-200 text-sand-600 hover:bg-sand-200"
              >
                <Filter size={18} />
                Filters
                {hasFilters && (
                  <span className="bg-sand-400 text-white text-xs px-2 py-0.5 rounded-full">{selectedGenera.size}</span>
                )}
              </button>

              {hasFilters && (
                <button
                  onClick={() => setSelectedGenera(new Set())}
                  className="text-sm transition-colors text-sand-400 hover:text-sand-600"
                >
                  Clear all
                </button>
              )}
            </div>

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${wildlife.length.toLocaleString()} ${type}…`}
              className="w-full font-serif bg-white px-3 py-2.5 text-xl rounded border border-sand-200 placeholder:text-sand-200 placeholder:italic outline-none focus:ring-2 focus:ring-sand-400 focus:ring-opacity-30"
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
              <p className="mt-10 font-serif italic text-center text-sand-400">
                No {type} found for "{search}"
              </p>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${showMobileFilters ? "bg-black bg-opacity-20" : "bg-transparent pointer-events-none"}`}
        onClick={() => setShowMobileFilters(false)}
      >
        <div
          className={`fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${showMobileFilters ? "translate-x-0" : "-translate-x-full"}`}
          onClick={e => e.stopPropagation()}
        >
          <div
            className={`flex flex-col h-full ${showMobileFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <div className="flex items-center justify-between p-4 border-b border-sand-200">
              <h3 className="font-['Montserrat',sans-serif] text-sand-600 text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 transition-colors text-sand-400 hover:text-sand-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="font-serif">
                {[...familyMap.entries()].map(([family, genera]) => (
                  <FamilyFilter
                    key={family}
                    family={family}
                    genera={genera}
                    openFamilies={openFamilies}
                    setOpenFamilies={setOpenFamilies}
                    familyChecked={familyState(family)}
                    toggleFamily={toggleFamily}
                    selectedGenera={selectedGenera}
                    toggleGenus={toggleGenus}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-sand-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedGenera(new Set())}
                  className="flex-1 px-4 py-2 transition-colors border rounded-lg border-sand-300 text-sand-600 hover:bg-sand-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-sand-400 hover:bg-sand-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
