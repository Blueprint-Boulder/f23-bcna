
export default function Card(props){
    return(
        <div className="flex gap-3 md:gap-5 items-center border-2 border-gray-200 border-w rounded-md hover:bg-gray-100">
            <img src={props.image} alt="wildlife photograph" className="ml-2 w-28 md:w-48 md:h-24 rounded-lg object-cover"/>
            <div className="py-2">
                <h3 className="md:text-xl font-bold">{props.name}</h3>
                <h5 className="text-sm italic mb-1">{props.scientificName} | {props.family}</h5>
                <p className="text-sm md:text-md md:w-11/12 text-ellipsis line-clamp-3">{props.description}</p>
            </div>
        </div>
    );
}