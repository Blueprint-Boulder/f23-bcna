import { useState, useEffect } from "react";
import { glossaryTerms } from "../data/glossaryTerms";

function termToId(term) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const Glossary = () => {
  const [glossaryVisible, setGlossaryVisible] = useState(false);
  const [pendingScroll, setPendingScroll] = useState(null);

  useEffect(() => {
    if (glossaryVisible && pendingScroll) {
      const el = document.getElementById(pendingScroll);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setPendingScroll(null);
    }
  }, [glossaryVisible, pendingScroll]);

  const handleTermClick = (e, term) => {
    e.preventDefault();
    const id = termToId(term);
    if (!glossaryVisible) {
      setGlossaryVisible(true);
      setPendingScroll(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="font-sans">

      {/* Banner */}
      <div
        className="relative h-[300px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/butterfly-hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <h1 className="relative z-10 font-serif text-white text-6xl font-bold tracking-wide drop-shadow-lg">
          Glossary
        </h1>
      </div>

      {/* Index of Terms */}
      <div className="max-w-4xl mx-auto px-8 mt-8 mb-6">
        <h2 className="font-serif text-xl font-bold text-sand-700 mb-3">Index of Terms</h2>
        <div className="columns-2 sm:columns-3 md:columns-4 gap-x-8">
          {glossaryTerms.map(({ term }) => (
            <a
              key={term}
              href={`#${termToId(term)}`}
              onClick={(e) => handleTermClick(e, term)}
              className="block text-sand-500 hover:text-sand-700 hover:underline transition-colors duration-200 text-sm leading-[1.4]"
            >
              {term}
            </a>
          ))}
        </div>
      </div>

      <hr className="border-sand-200 mx-auto max-w-4xl w-full px-8" />

      {/* Glossary of Terms */}
      {glossaryVisible && (
        <div className="max-w-4xl mx-auto px-8 mt-8 mb-20">
          <h2 className="font-serif text-xl font-bold text-sand-700 mb-6">Glossary of Terms</h2>
          <dl className="space-y-4">
            {glossaryTerms.map(({ term, description }) => (
              <div key={term} id={termToId(term)} className="glossary-term scroll-mt-[25vh] px-1 -mx-1">
                <dt className="inline font-sans font-semibold text-sand-700">{term}: </dt>
                <dd className="inline font-sans text-sand-600 leading-relaxed">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

    </div>
  );
};
