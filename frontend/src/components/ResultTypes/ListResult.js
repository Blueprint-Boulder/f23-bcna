import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const ListResult = ({ data }) => {
  console.log("Image Data:", data.image); // Log image data to console
  const [thumbnail, setThumbnail] = useState(
    "https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2FThe%2520Flatirons%2520in%2520Summertime_0.jpg&w=3840&q=75"
  );
  useEffect(() => {
    const thumbnailField = data.field_values.find(
      (field) => field.name === "thumbnail"
    );
    if (thumbnailField) {
      setThumbnail(
        `http://127.0.0.1:5000/api/get-image/${thumbnailField.value}`
      );
    }
  }, [data]);
  return (
    <div className="list-result flex items-center p-4 border mb-4 rounded-lg">
      {/* Image on the left */}
      <img
        src={thumbnail}
        alt={data.name}
        className="w-24 h-22 object-contain mr-4"
      />

      {/* Details on the right */}
      <div className="flex flex-col">
        {/* Name at the top in larger font */}
        <Link className="text-lg font-bold mb-2" to={`/wildlife/${data.id}`}>
          {data.name}
        </Link>

        {/* Subcategory under the name */}
        <p className="text-sm">{data.scientific_name}</p>
      </div>
    </div>
  );
};

export default ListResult;
