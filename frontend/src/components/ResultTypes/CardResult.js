import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const CardResult = ({ data }) => {
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
    <div className="card-result p-4 border mb-4 rounded-lg">
      {/* Image on the top */}
      <img
        src={thumbnail}
        className="mx-auto object-contain w-64 aspect-video"
      />

      {/* Details underneath */}
      <div className="flex flex-col">
        {/* Name */}
        <Link className="text-lg font-bold mb-2" to={`/wildlife/${data.id}`}>
          {data.name}
        </Link>

        {/* Subcategory */}
        <p className="text-sm">{data.scientific_name}</p>
      </div>
    </div>
  );
};

export default CardResult;
