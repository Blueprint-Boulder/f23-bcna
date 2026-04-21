export const Resources = () => {
  return (
    <div className="font-sans">

      {/* Hero Banner */}
      <div
        className="relative h-[300px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/butterfly-hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <h1 className="relative z-10 font-serif text-white text-6xl font-bold tracking-wide drop-shadow-lg">
          Resources
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-[1183px] mx-32 mt-14 mb-20">

        <h2 className="text-3xl font-bold font-serif text-[#193024] mb-6">
          Resources for Front Range Naturalists
        </h2>

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          Field Guides & Books
        </h3>
        <p className="leading-[1.75] mb-4">
          BCNA has published several field guides to help identify wildlife in the Colorado Front Range:
        </p>
        <ul className="list-disc list-inside leading-[2] mb-10 space-y-1">
          <li>
            <em>Butterflies of the Colorado Front Range: A Photographic Guide to 100 Species</em> by Janet R. Chu and Stephen R. Jones —
            covers 100 frequently seen species from the Wyoming border to Pueblo, with over 120 color photos.
          </li>
          <li>
            <em>Dragonflies of the Colorado Front Range: A Photographic Guide</em> by Ann Cooper —
            covers 45 dragonfly and 28 damselfly species with habitat, behavior, and flight time information.
          </li>
          <li>
            <em>Colorado Flora, Eastern Slope</em> by William Weber — a comprehensive reference to all documented plant species
            on Colorado's eastern slope.
          </li>
        </ul>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          Online Databases & Tools
        </h3>
        <p className="leading-[1.75] mb-4">
          These websites are valuable references for identifying and reporting wildlife sightings in the region:
        </p>
        <ul className="list-disc list-inside leading-[2] mb-10 space-y-1">
          <li>
            <a href="https://www.butterfliesandmoths.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
              Butterflies and Moths of North America
            </a>{" "}
            — species accounts, range maps, and a sighting database for Lepidoptera across North America.
          </li>
          <li>
            <a href="https://coloradofrontrangebutterflies.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
              Colorado Front Range Butterflies
            </a>{" "}
            — photographs, species accounts, and checklists specific to the Front Range.
          </li>
          <li>
            <a href="https://bugguide.net/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
              BugGuide
            </a>{" "}
            — identification, images, and information for insects, spiders, and their kin in the US and Canada.
          </li>
          <li>
            <a href="https://www.bumblebeewatch.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
              Bumble Bee Watch
            </a>{" "}
            — submit photos of bumble bee sightings to help track wild populations across North America.
          </li>
          <li>
            <a href="https://bcna.org/research-data/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
              BCNA Research Data
            </a>{" "}
            — long-term monitoring data and research findings collected by BCNA volunteers and partners.
          </li>
        </ul>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          Mobile Apps
        </h3>
        <p className="leading-[1.75]">
          Several apps can help you identify species in the field:
        </p>
        <ul className="list-disc list-inside leading-[2] mt-4 space-y-1">
          <li>
            <strong>iNaturalist</strong> — photograph and identify plants, insects, birds, and more; all observations
            contribute to global biodiversity science.
          </li>
          <li>
            <strong>Audubon Butterflies</strong> — identification guide covering 720+ butterfly species found in North America.
          </li>
          <li>
            <strong>Colorado Rocky Mountain Wildflowers</strong> — covers 520 wildflower species found throughout Colorado.
          </li>
        </ul>
      </div>
    </div>
  );
};
