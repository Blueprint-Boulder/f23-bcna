import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const CardResult = ({ data }) => {
  const [thumbnail, setThumbnail] = useState(
    "https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2FThe%2520Flatirons%2520in%2520Summertime_0.jpg&w=3840&q=75"
  );
  useEffect(() => {
    if (data.thumbnail_id) {
      setThumbnail(`${import.meta.env.VITE_BACKEND_URL}/api/get-image-by-image-id/${data.thumbnail_id}`);
    }
  }, [data]);

  return (
    <div className="p-4 mb-4 border rounded-lg card-result">
      {/* Image on the top */}
      <img src={thumbnail} className="object-contain w-64 mx-auto aspect-video" />

      {/* Details underneath */}
      <div className="flex flex-col">
        {/* Name */}
        <Link className="mb-2 text-lg font-bold" to={`/wildlife/${data.id}`}>
          {data.name}
        </Link>

        {/* Subcategory */}
        <p className="text-sm">
          <em>{data.scientific_name}</em>
        </p>
      </div>
    </div>
  );
};

export default CardResult;
