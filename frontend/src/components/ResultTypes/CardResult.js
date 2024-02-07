import { Link } from "react-router-dom"

const CardResult = ({ data }) => {
    return (
      <div className="card-result p-4 border mb-4 rounded-lg">
        {/* Image on the top */}
        <img src={data.image} alt={data.name} className="w-full h-40 object-cover mb-4 rounded-t-lg" />
  
        {/* Details underneath */}
        <div className="flex flex-col">
          {/* Name */}
          <Link className="text-lg font-bold mb-2" to={`/wildlife/${data.name}`}>{data.name}</Link>
          
          {/* Subcategory */}
          <p className="text-sm">{data.subcategory}</p>
        </div>
      </div>
    )
  }
export default CardResult
  