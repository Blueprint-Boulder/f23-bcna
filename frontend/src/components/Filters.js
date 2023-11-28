import { useState } from "react";

export default function Filters() {

    // List of categories to filter by with their respective keys and subcategories
    const categories = [
        {
            id: 0,
            label: "Family",
            subcategories: [
                "Mammal",
                "Bird",
                "Reptile",
                "Amphibian",
                "Fish",
                "Invertebrate"
            ]
        },
        {
            id: 1,
            label: "Color",
            subcategories: [
                "Red",
                "Orange",
                "Yellow",
                "Green"
            ]
        }
    ]

    const [expandedFilters, setExpandedFilters] = useState({})


    function toggleFilter(filter) {
        setExpandedFilters((prev) => ({
            ...prev, [filter]: !prev[filter],
        }))
        console.log(expandedFilters)
    }

    return(
        <div className="search-results__filters w-1/4 hidden md:block">
            {/* Filter Search Results Options */}
            <div className="flex flex-col items-left">
                {/* Title */}
                <div className="my-2">
                    <label htmlFor="titleFilter" className="text-lg font-bold">Filter by</label>
                </div>

                {/* Filter by category */}
                {categories.map((category) => {
                    return (
                        <div key={category.id}>
                            <hr className="my-2 border-t border-gray-300 w-3/4"/>
                            <div className="flex flex-row justify-between w-3/4">
                                <label htmlFor="categoryFilter" className="text-lg font-bold">{category.label}</label>
                                <button className="text-lg" onClick={() => toggleFilter(category.id)}>{expandedFilters[category.id] ? "-" : "+"}</button>
                            </div>
                            {/* Category subcategories */}
                            {expandedFilters[category.id] && (
                                <div className="flex flex-col items-left">
                                    {category.subcategories.map((subcategory) => {
                                        return (
                                            <div key={subcategory}>
                                                <label htmlFor={subcategory}>{subcategory}</label>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
                {/* Final Horizontal Line */}
                <hr className="my-2 border-t border-gray-300 w-3/4"/>
            </div>
        </div>
    );

}