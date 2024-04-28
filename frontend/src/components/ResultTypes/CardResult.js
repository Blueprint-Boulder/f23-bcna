
import { Link } from "react-router-dom";


const CardResult = ({ data }) => {

  return (
    <div className="card-result p-4 border mb-4 rounded-lg">
      {/* Image on the top */}
      <img src="https://www.lachmanconsultants.com/wp-content/uploads/2022/07/iStock-1308305388.jpg"/>

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



