const ListResult = ({ data }) => {
    return (
      <div className="list-result flex items-center p-4 border mb-4 rounded-lg">
        {/* Image on the left */}
        <img src={data.image} alt={data.name} className="w-26 h-22 object-cover mr-4" />
  
        {/* Details on the right */}
        <div className="flex flex-col">
          {/* Name at the top in larger font */}
          <div className="text-lg font-bold mb-2">{data.name}</div>
          
          {/* Subcategory under the name */}
          <p className="text-sm">{data.subcategory}</p>
        </div>
      </div>
    )
  }
  
export default ListResult
  