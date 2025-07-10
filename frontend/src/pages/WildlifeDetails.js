import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/apiService";

export default function WildlifeDetails() {
  const { wildlifeId } = useParams(); // Extracting the 'name' parameter from the URL

  const [wildlife, setWildlife] = useState(null);
  const [filteredData, setFilteredData] = useState({});
  const [highlight, setHighlight] = useState(null);
  const [images, setImages] = useState([]);

  const displayFilter = (wildData, catsAndFields, foundImages) => {
    const { id, scientific_name, name, category_id, thumbnail_id, ...displayedData } =
      wildData;
    const filtered = Object.keys(displayedData).reduce((acc, key) => {
      if (!foundImages.includes(key)) {
        acc[key] = displayedData[key];
      }
      return acc;
    }, {});
    return {
      Name: name,
      "Scientific Name": scientific_name,
      Category: catsAndFields["categories"][category_id]["name"],
      ...filtered,
    };
  };

  const findImages = async (wildlifeData) => {
    const categoriesAndFields = await apiService.getCategoriesAndFields();
    const wildlifeImages = await apiService.getImagesByWildlifeId(wildlifeData["id"]);
    setImages(wildlifeImages);
    if (wildlifeImages.length > 0) setHighlight(wildlifeImages[0].image_path);
    setFilteredData(displayFilter(wildlifeData, categoriesAndFields, []));
  };

  useEffect(() => {
    const fetchWildlifeById = async () => {
      try {
        // Fetch wildlife data by ID
        const data = await apiService.getWildlifeById(wildlifeId);
        setWildlife(data); // Set the wildlife state with the fetched data
        findImages(data);
        // Set the initial highlight image to the first image in the images array
      } catch (error) {
        console.error("Error fetching wildlife details:", error);
      }
    };

    fetchWildlifeById(); // Call the function to fetch wildlife data when component mounts
  }, [wildlifeId]); // Re-run the effect when wildlifeId changes

  return (
    <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] bg-cover w-screen h-[120vh]">
      <div className="h-8"></div>
      <div className="bg-neutral-50 rounded-lg w-11/12 mx-auto shadow-lg overflow-auto h-[90%]">
        {wildlife && (
          <>
            <h2 className="text-center text-2xl md:text-3xl pt-4 font-bold text-green-900 mb-8">
              {wildlife.name}
            </h2>
            <div className="md:flex md:justify-around md:flex-wrap pb-10">
              <div className="pl-10 w-11/12 lg:pl-0 lg:w-2/5">
                {Object.entries(filteredData).map(([key, value]) => (
                  <div key={key} className="mb-5">
                    <h3 className="inline text-xl font-bold">{key}: </h3>
                    <span className="text-lg">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center">
                {images.length >= 1 && (
                  <img
                    src={`http://127.0.0.1:5000/api/get-image/${highlight}`}
                    alt=""
                    className="mb-5 min-w-80 h-64 object-cover"
                  />
                )}
                <div className="flex flex-wrap justify-center gap-3 p-4 bg-neutral-100 rounded-md shadow-inner">
  {images.length >= 2 &&
    images.map((image) => (
      <button
        key={image.id}
        onClick={() => setHighlight(image.image_path)}
        className={`transition-all duration-150 ease-in-out rounded-md focus:outline-none 
          ${highlight === image.image_path ? "ring-2 ring-offset-2 ring-sky-500" : "hover:ring-2 hover:ring-sky-300"}`}
      >
        <img
          draggable="false"
          className="object-cover w-28 h-20 md:w-36 md:h-24 rounded-md"
          src={`http://127.0.0.1:5000/api/get-image/${image.image_path}`}
          alt=""
        />
      </button>
    ))}
</div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
