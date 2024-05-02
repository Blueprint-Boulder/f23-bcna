import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/apiService";

export default function WildlifeDetails() {
    const { wildlifeId } = useParams(); // Extracting the 'name' parameter from the URL

    const [wildlife, setWildlife] = useState(null);
    const [highlight, setHighlight] = useState(null);
    const [imageSrc, setImageSrc] = useState("");

    useEffect(() => {
        const fetchWildlifeById = async () => {
            try {
                // Fetch wildlife data by ID
                const data = await apiService.getWildlifeById(wildlifeId);
                console.log(data)
                setWildlife(data); // Set the wildlife state with the fetched data
                // Set the initial highlight image to the first image in the images array
            } catch (error) {
                console.error("Error fetching wildlife details:", error);
            }
        };

        fetchWildlifeById(); // Call the function to fetch wildlife data when component mounts
        console.log(wildlife);
    }, [wildlifeId]); // Re-run the effect when wildlifeId changes

    useEffect(() => {
        const fetchImages = async () => {
            try{
                console.log(wildlife);
                console.log(wildlife["image"])
                const data = await apiService.getImage(wildlife["image"]);
                console.log(data);
                const imageUrl = URL.createObjectURL(data);
                setImageSrc(imageUrl);
                setHighlight(data.images[0]);
            } catch (error) {
                console.error("Error fetching image:", error);
            }
        }

        if(wildlife){
            fetchImages();
        }
    }, [wildlife])

    return (
        <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] w-screen h-[120vh]">
            <div className="h-8"></div>
            <div className="bg-neutral-50 rounded-lg w-11/12 mx-auto shadow-lg">
                {wildlife && (
                    <>
                        <h2 className="text-center text-2xl md:text-3xl pt-4 font-bold text-green-900 mb-8">{wildlife.name}</h2>
                        <div className="md:flex md:justify-around pl-5 pr-5 pb-10">
                            <div className="md:w-2/5">
                                {Object.entries(wildlife).map(([key, value]) => (
                                    key === 'images' ?
                                        <></>
                                        :
                                        <div key={key} className="mb-5">
                                            <h3 className="inline text-lg font-bold">{key}: </h3>
                                            <span>{value}</span>
                                        </div>
                                ))}
                            </div>

                                    <img src={`http://127.0.0.1:5000/api/get-image/${wildlife["image"]}`} alt="" className="mx-auto mb-5 w-48 object-cover" />
                                    {/* <div className="flex justify-center gap-3">
                                        {wildlife.images.map((image) => (
                                            <button key={image.alt} onClick={() => setHighlight(image)}>
                                                <img draggable="false" className={"object-cover w-16 h-8 md:w-36 md:h-16 rounded-md " + (highlight === image ? " border-blue-500 border-2" : "hover:border-blue-300 hover:border-2")}
                                                    src={imageSrc} alt="" />
                                            </button>
                                        ))}
                                    </div> */}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
    
}
