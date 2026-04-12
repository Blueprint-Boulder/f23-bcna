import { Link } from "react-router-dom";

export const About = () => {
  return (
    <div className="font-sans">

      {/* Hero Banner */}
      <div
        className="relative h-[300px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/butterfly-hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <h1 className="relative z-10 font-serif text-white text-6xl font-bold tracking-wide drop-shadow-lg">
          About the Site
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-[1183px] mx-32 mt-14 mb-20">

        <h2 className="text-3xl font-bold font-serif text-[#193024] mb-6">
          Replace with Better Header
        </h2>

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          Geographic Region
        </h3>
        <p className="leading-[1.75] mb-4">
          The Front Range refers to the area from the Continental Divide to the Plains and the
          Colorado-Wyoming border south along the east side of the Rocky Mountains to the southern
          border of Pueblo County. This area includes the following counties: Larimer, Boulder,
          Broomfield, Gilpin, Clear Creek, Jefferson, Denver, Douglas, Park, Teller, El Paso,
          Fremont, and Pueblo.
        </p>
        <p className="leading-[1.75] mb-10">
          This geographic region encompasses five biologic life zones: plains, foothills, montane,
          sub-alpine, and alpine, and partly explains why Boulder County, in the center of the
          defined area, has had recorded sightings for 203 butterfly species identified. In the
          designated Front Range area, there have been reported sightings of approximately 226
          species, based on information from the website:{" "}
          <a
            href="https://www.butterfliesandmoths.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            Butterflies and Moths of North America
          </a>
          .
        </p>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          Get Involved
        </h3>
        <p className="leading-[1.75] mb-10">
          This website includes information on only some of the species in the checklists. We hope
          over time to have photos and information posted for as many species as possible found in
          the Front Range area. To accomplish this goal, we welcome participation within the
          butterfly community and nature lovers in general. We encourage advice and support from
          professional lepidopterists, nature photographers, butterfly watchers, and enthusiasts,
          which will help create a community website of benefit to everyone. Your input and resource
          contributions are encouraged and appreciated. All submitted and approved images will be
          credited with copyright retained by the original photographer.
        </p>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          Copyright Statement
        </h3>
        <p className="leading-[1.75]">
          For further information on copyright and/or use of specific images, please{" "}
          <Link to="/contact" className="underline hover:text-blue-800">
            contact us
          </Link>
          .
        </p>

      </div>
    </div>
  );
};
