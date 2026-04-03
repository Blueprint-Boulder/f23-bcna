import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import apiService from "../services/apiService";

export default function WildlifeDetails() {
  const { category, wildlifeId } = useParams();
  const [wildlife, setWildlife] = useState(null);
  const [filteredData, setFilteredData] = useState({});
  const [thumbnail, setThumbnail] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [images, setImages] = useState([]);
  const [imageClicked, setImageClicked] = useState(null);

  const BASE_IMG_URL = "http://127.0.0.1:5000/api/get-image/";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getWildlifeById(wildlifeId, category);
        const categoriesAndFields = await apiService.getCategoriesAndFields(category);
        const wildlifeImages = await apiService.getImagesByWildlifeId(data.id, category);

        setWildlife(data);
        setImages(wildlifeImages);
        if (wildlifeImages.length > 0) setThumbnail(wildlifeImages[0].image_path);
        if (wildlifeImages.length > 0) setHighlight(wildlifeImages[0].image_path);

        // Filter logic to exclude technical IDs from the display
        const { id, scientific_name, name, category_id, thumbnail_id, ...rest } = data;
        setFilteredData(rest);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchData();
  }, [wildlifeId, category]);

  if (!wildlife) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-sand-50/30 pb-20">
      {/* 1. Blurred Header Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={`${BASE_IMG_URL}${thumbnail}`}
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
          alt="background"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-sand-50">
          <Link to={`/${category}`} className="absolute top-4 left-4 text-sm md:text-base hover:underline">
            ← Back to Database
          </Link>
          <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-center">
            {wildlife.name}
          </h1>
          <p className="text-xl md:text-2xl font-['Playfair_Display'] italic mt-2 opacity-90">{wildlife.scientific_name}</p>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-6xl mx-auto -mt-10 relative z-10 px-4">
        <div className="bg-sand-50 rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row p-6 gap-8">
          
          {/* Left Column: Info Card */}
          <div className="lg:w-5/12 bg-sand-100/70 p-8 rounded-2xl border border-sand-200/50">
            {Object.entries(filteredData).map(([key, value]) => (
              <div key={key} className="mb-6">
                <h3 className="text-sand-600 font-bold text-xl capitalize mb-1">
                  {key.replace("_", " ")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {value || "No information available."}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Image Display */}
          <div className="lg:w-7/12 flex flex-col">
            <div className="relative group cursor-zoom-in">
              <img
                src={`${BASE_IMG_URL}${highlight}`}
                alt={wildlife.name}
                className="w-full h-[400px] object-cover rounded-2xl shadow-md transition-transform"
                onClick={() => setImageClicked(highlight)}
              />
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex items-center justify-center mt-6 gap-4 overflow-x-auto p-2 scrollbar-hide">
              <div className="flex gap-3">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={`${BASE_IMG_URL}${img.image_path}`}
                    className={`w-24 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                      highlight === img.image_path 
                      ? "ring-4 ring-sand-500 scale-105" 
                      : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setHighlight(img.image_path)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {imageClicked && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setImageClicked(null)}
        >
          <img
            src={`${BASE_IMG_URL}${imageClicked}`}
            className="max-h-full max-w-full rounded-lg"
          />
          <button className="absolute top-5 right-5 text-white text-3xl">&times;</button>
        </div>
      )}
    </div>
  );
}