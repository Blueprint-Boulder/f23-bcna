import { useState } from "react";

export default function WildlifeDetails({wildlife}) {
    
    const uppercase = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);;
    }

    const [highlight, setHighlight] = useState(wildlife.images[0])

    return(
        <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] w-screen h-screen">
            <div className="h-8"></div>
            <div className="bg-neutral-50 rounded-lg w-11/12 mx-auto shadow-lg">
                <h2 className="text-center text-2xl md:text-3xl pt-4 font-bold text-green-900 mb-8">{wildlife.name}</h2>
                <div className="md:flex md:justify-around pl-5 pr-5 pb-10">
                    <div className="md:w-2/5">
                        {Object.entries(wildlife).map(([key, value]) => (
                            key === 'images' ? 
                            <></>
                            :
                            <div key={key} className="mb-5">
                                <h3 className="inline text-lg font-bold">{uppercase(key)}: </h3>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <img src={highlight.file} alt={highlight.alt} className="mx-auto mb-5" />
                        <div className="flex justify-center gap-3">
                            {wildlife.images.map((image) => (
                                <button onClick={() => setHighlight(image)}>
                                    <img className="object-cover w-16 h-8 md:w-36 md:h-16" src={image.file} alt={image.alt} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}