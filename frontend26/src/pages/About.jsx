import Content from "../content/About.md";

export const About = () => {
  return (
    <div className="font-sans">
      {/* Hero Banner */}
      <div
        className="relative h-[300px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/butterfly-hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <h1 className="relative z-10 p-5 font-serif text-6xl font-bold tracking-wide text-white drop-shadow-lg">
          About the Site
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-[1183px] px-5 mt-14 mb-20 mx-auto">
        <Content />
      </div>
    </div>
  );
};
