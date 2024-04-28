import { Link } from "react-router-dom"

const ListResult = ({ data }) => {
  console.log("Image Data:", data.image); // Log image data to console
    return (
      <div className="list-result flex items-center p-4 border mb-4 rounded-lg">
        {/* Image on the left */}
        <img src={`data:image/jpg;base64,${data.image}`} alt={data.name} className="w-24 h-22 object-cover mr-4" />
  
        {/* Details on the right */}
        <div className="flex flex-col">
          {/* Name at the top in larger font */}
          <Link className="text-lg font-bold mb-2" to={`/wildlife/${data.id}`}>{data.name}</Link>
          
          {/* Subcategory under the name */}
          <p className="text-sm">{data.scientific_name}</p>
        </div>
      </div>
    )
  }
  
export default ListResult
  