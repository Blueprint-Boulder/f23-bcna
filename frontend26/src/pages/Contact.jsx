export const Contact = () => {
  return (
    <div className="font-sans">
      {/* Hero Banner */}
      <div
        className="relative h-[300px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/butterfly-hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <h1 className="relative z-10 font-serif text-white text-6xl font-bold tracking-wide drop-shadow-lg">Contact</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-[1183px] px-5 mt-14 mb-20">
        <h2 className="text-3xl font-bold font-serif text-[#193024] mb-6">Get in Touch</h2>

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">Contact BCNA</h3>
        <p className="leading-[1.75] mb-10">
          For questions, feedback, or to contribute photos and species information to this site, please reach out to the
          Boulder County Nature Association through the contact form on the{" "}
          <a
            href="https://bcna.org/bcna-contacts/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            BCNA website
          </a>
          . We welcome participation from photographers, naturalists, and enthusiasts of all experience levels. All
          submitted and approved images will be credited with copyright retained by the original photographer.
        </p>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">Mailing Address</h3>
        <p className="leading-[1.75] mb-10">
          Boulder County Nature Association
          <br />
          P.O. Box 493
          <br />
          Boulder, CO 80306
        </p>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">Follow Us</h3>
        <p className="leading-[1.75]">
          Stay up to date with BCNA events, field trips, and nature news on social media. Find us on{" "}
          <a
            href="https://www.facebook.com/BoulderCountyNatureAssociation"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            Facebook
          </a>{" "}
          and{" "}
          <a
            href="https://www.instagram.com/bouldernatue"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            Instagram
          </a>
          .
        </p>
      </div>
    </div>
  );
};
