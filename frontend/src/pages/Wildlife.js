import { useEffect, useState } from "react"

import { SearchBar } from "../components/SearchBar"
import { GridResult, ListResult, CardResult } from "../components/ResultTypes"

export const Wildlife = () => {

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

    // Dummy data for testing
    const data = [
        {
            id: 0,
            name: "Two-Tailed Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2022/09/Swallowtail_Two-tailed_CFriedman.jpg"
        },
        {
            id: 1,
            name: "Western Tiger Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/WESTERN_TIGER_SWALLOWTAIL1.jpe"
        },
        {
            id: 2,
            name: "Black Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2022/10/Swallowtail_Black-female_SJones.jpg"
        },
        {
            id: 3,
            name: "Pine White",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/PINE_WHITE1.jpe"
        }
    ]



    // Display type
    const [displayType, setDisplayType] = useState("cards")
    // State for determining which categories are expanded in filters section
    const [expandedCategories, setExpandedCategories] = useState([])
    // State for determining which subcategories are selected in filters section
    const [selectedSubcategories, setSelectedSubcategories] = useState([])
    // State for determining which results to display
    const [results, setResults] = useState(data)


    const toggleCategory = (categoryId) => {
        if (expandedCategories.includes(categoryId)) {
          setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
        } else {
          setExpandedCategories([...expandedCategories, categoryId]);
        }
    }

    const renderResults = () => {
        switch (displayType) {
            case 'grid':
                return (
                    <table className="table-auto">
                        <thead>
                        <tr>
                            <th className="text-left">Name</th>
                            <th className="text-left">Subcategory</th>
                        </tr>
                        </thead>
                        <tbody>
                        {results.map((result,index) => {return <GridResult key={index} data={result}/>})}
                        </tbody>
                    </table>
                )
            case 'list':
                return results.map((result,index) => {return <ListResult key={index} data={result}/>})
            case 'cards':
                return (
                    <div className="grid grid-cols-3 gap-2">
                      {results.map((result, index) => (
                        <div key={index} className="w-full">
                          <CardResult data={result} />
                        </div>
                      ))}
                    </div>
                  )
            default:
                return null;
        }
    }


    // Filter results by selected subcategories
    useEffect(() => {
        // If no subcategories are selected, show all results
        if (selectedSubcategories.length === 0) {
          setResults(data);
        } else {
          // Filter results by selected subcategories
          const filteredResults = data.filter((result) => {
            return selectedSubcategories.includes(result.subcategory);
          });
      
          setResults(filteredResults);
        }
    }, [selectedSubcategories]);



    return (
        <>
        {/* Image and Search Bar */}
        <div className="wildlife relative text-center">
        <img
            src="http://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/inner5.jpg"
            alt="Wildlife"
            className="w-full"
        />
        <div className="absolute w-2/5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SearchBar className=""/>
        </div>
        </div>
        {/* Search Results */}
        <div className="search-results flex mx-20 my-10 gap-5">
            <div className="search-results__filters w-1/4">

                {/* Filter Search Results Options */}
                <div class="flex flex-col items-left">
                    {/* Title */}
                    <div class="my-2">
                        <label for="titleFilter" class="text-lg font-bold">Filter by</label>
                    </div>

                    {/* Filter by category */}
                    {categories.map((category) => {

                        const isCategoryExpanded = expandedCategories.includes(category.id)

                        return (
                            <div key={category.id}>
                                <hr class="my-2 border-t border-gray-300 w-3/4"/>
                                <div class="flex flex-row justify-between w-3/4">
                                    <label for="categoryFilter" class="text-lg font-bold">{category.label}</label>
                                    <button class="text-lg" onClick={() => toggleCategory(category.id)}>
                                        {isCategoryExpanded ? '-' : '+'}
                                    </button>
                                </div>
                                {/* Category subcategories */}
                                {isCategoryExpanded &&
                                    <div class="flex flex-col items-left">
                                        {category.subcategories.map((subcategory) => {
                                            const isSelected = selectedSubcategories.includes(subcategory)
                                            return (
                                                <div class="flex flex-row justify-left gap-2">
                                                    
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            if (isSelected) {
                                                                setSelectedSubcategories(selectedSubcategories.filter((selectedSubcategory) => {
                                                                    return selectedSubcategory !== subcategory
                                                                }))
                                                            } else {
                                                                setSelectedSubcategories([...selectedSubcategories, subcategory])
                                                            }
                                                        }}
                                                    />
                                                    <label for="subcategoryFilter" class="text-lg">{subcategory}</label>
                                                </div>
                                            )
                                        }
                                        )}
                                    </div>
                                }
                            </div>
                        )
                    })}
                    {/* Final Horizontal Line */}
                    <hr class="my-2 border-t border-gray-300 w-3/4"/>




                </div>
            </div>
            {/* Search Results */}
            <div className="search-results__list w-3/4">
                <div className="flex flex-col">
                    {/* Results Navigation */}
                    <div className="flex flex-row justify-between items-center p-4 rounded-md">
                    {/* Number of Results */}
                    <div className="">
                        <p className="text-gray-700">{results.length} results</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-gray-700">Display:</p>
                        <button onClick={() => setDisplayType('grid')}>Grid</button>
                        <button onClick={() => setDisplayType('list')}>List</button>
                        <button onClick={() => setDisplayType('cards')}>Cards</button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="text-gray-700">Sort by:</p>
                        <select className="border border-solid border-gray-300 rounded px-2 py-1">
                        <option value={null}>Name</option>
                        <option value="subcategory">Subcategory</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="hover:bg-light-blue hover:text-white text-light-black font-bold py-2 px-4 rounded-full">
                        {"<"}
                        </button>
                        <p className="text-gray-700">1/12</p>
                        <button className="hover:bg-light-blue hover:text-white text-light-black font-bold py-2 px-4 rounded-full">
                        {">"}
                        </button>
                    </div>
                    </div>


                    {/* Results */}
                    {renderResults()}

                </div>
            </div>
        </div>
        </>
    )
}