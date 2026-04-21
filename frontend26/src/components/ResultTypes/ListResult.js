import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const ListResult = ({ data }) => {
  console.log("Image Data:", data.image); // Log image data to console
  const [thumbnail, setThumbnail] = useState(
    "https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2FThe%2520Flatirons%2520in%2520Summertime_0.jpg&w=3840&q=75"
  );
  useEffect(() => {
    if (data.thumbnail_id) {
      setThumbnail(`${import.meta.env.VITE_BACKEND_URL}/api/get-image-by-image-id/${data.thumbnail_id}`);
    }
  }, [data]);
  return (
    <div className="flex items-center p-4 mb-4 border rounded-lg list-result">
      {/* Image on the left */}
      <img src={thumbnail} alt={data.name} className="object-contain mr-4 w-36 h-22" />

      {/* Details on the right */}
      <div className="flex flex-col">
        {/* Name at the top in larger font */}
        <Link className="mb-2 text-lg font-bold" to={`/wildlife/${data.id}`}>
          {data.name}
        </Link>

        {/* Subcategory under the name */}
        <p className="text-sm">
          <em>{data.scientific_name}</em>
        </p>
      </div>
    </div>
  );
};

export default ListResult;
