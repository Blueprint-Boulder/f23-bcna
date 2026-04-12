export const Contact = () => {
  return (
    <div className="font-sans">

      {/* Hero Banner */}
      <div
        className="relative h-[300px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/butterfly-hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <h1 className="relative z-10 font-serif text-white text-6xl font-bold tracking-wide drop-shadow-lg">
          Contact
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-[1183px] mx-32 mt-14 mb-20">

        <h2 className="text-3xl font-bold font-serif text-[#193024] mb-6">
          [Section Header]
        </h2>

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          [Subheading 1]
        </h3>
        <p className="leading-[1.75] mb-10">[Insert content here]</p>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          [Subheading 2]
        </h3>
        <p className="leading-[1.75] mb-10">[Insert content here]</p>

        <hr className="bg-[#C7BDAA] border-[#C7BDAA] h-[2px] mb-10" />

        <h3 className="font-serif text-xl font-semibold text-[#193024] mb-3">
          [Subheading 3]
        </h3>
        <p className="leading-[1.75]">[Insert content here]</p>

      </div>

    </div>
  );
};
