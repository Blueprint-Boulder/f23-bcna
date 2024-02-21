import { useEffect, useState } from "react"

import { SearchBar } from "../components/SearchBar"
import { FilterBar } from "../components/FilterBar"
import { GridResult, ListResult, CardResult } from "../components/ResultTypes"

export const Wildlife = () => {

    // List of categories to filter by with their respective keys and subcategories
    const categoriesAndFields = {
        "categories": [
            {
                "id" : 1,
                "field_ids": [
                    1,
                    2
                ],
                "name": "Animals",
                "subcategories": [
                    {
                        "id" : 2,
                        "field_ids": [
                            3
                        ],
                        "name": "Forest Animals",
                        "subcategories": [
                            {
                                "id" : 3,
                                "field_ids": [
                                    3
                                ],
                                "name" : "Fox",
                                "subcategories" : []
                            },
                            {
                                "id" : 4,
                                "field_ids": [
                                    5
                                ],
                                "name" : "Butterflies",
                                "subcategories" : []
                            }
                        ]
                    },
                    {
                        "field_ids": [],
                        "name": "Cats",
                        "subcategories": []
                    }
                ]
            },
            {
                "id" : 15,
                "field_ids": [
                    1,
                    2
                ],
                "name": "Plants",
                "subcategories": []
            }
        ],
        "fields": {
            "1": {
                "id": 1,
                "name": "Description",
                "type": "TEXT"
            },
            "2": {
                "id": 2,
                "name": "Note",
                "type": "TEXT"
            },
            "3": {
                "id": 3,
                "name": "Wingspan",
                "type": "INTEGER"
            }
        }
    };


    

    // Dummy data for testing
    const data = [
        {
            id: 0,
            name: "Two-Tailed Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2022/09/Swallowtail_Two-tailed_CFriedman.jpg",
            category_id: 4
        },
        {
            id: 1,
            name: "Western Tiger Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/WESTERN_TIGER_SWALLOWTAIL1.jpe",
            category_id: 4
        },
        {
            id: 2,
            name: "Black Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2022/10/Swallowtail_Black-female_SJones.jpg",
            category_id: 4
        },
        {
            id: 3,
            name: "Pine White",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/PINE_WHITE1.jpe",
            category_id: 4
        },
        {
            id: 3,
            name: "Arctic Fox",
            subcategory: "Invertebrate",
            image: "https://cdn.britannica.com/23/178223-050-2EA8AA51/Arctic-fox.jpg",
            category_id: 3
        },
        {
            id: 3,
            name: "Red Fox",
            subcategory: "Invertebrate",
            image: "https://cdn.britannica.com/95/206395-050-02B81B30/Red-fox-Vulpes-vulpes.jpg",
            category_id: 3
        },
    ]

    // Convert categories and fields JSON object into something able to be handled by JS
    const categories = Object.values(categoriesAndFields.categories);
    const fields = Object.values(categoriesAndFields.fields);

    // State for determining which results to display
    const [results, setResults] = useState(data)



    /**
     * 
     * FILTERING
     * 
     */

    // Defines the filters for search... handled in FilterBar
    const [filters, setFilters] = useState({
        category: [],
    })


    /**
     * 
     * SORTING
     * 
     */


    // Sort by state
    const [sortBy,setSortBy] = useState('none')

    // Function to handle the change in sortBy category (name,none)
    const handleSortByChange = (event) => {
        setSortBy(event.target.value); // Update the sortBy state
    };

    // Function that sorts results by name
    const sortResultsByName = (results) => {
        return [...results].sort((a, b) => a.name.localeCompare(b.name));
    };

    // Function to sort results by name or none
    const sortResults = () => {
        switch (sortBy) {
            case 'name':
                return sortResultsByName(results);
            default:
                return results; // Default case, return unsorted results
        }
    };



    /**
     * 
     * PAGINATION
     * 
     */
    

    // Current page and results per page states
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(5); // Number of results per page

    // Function to handle the change in number of results per page
    const handleResultsPerPageChange = (event) => {
    setResultsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Reset to first page when changing results per page
    };

    // Function to get total number of pages
    const totalPages = Math.ceil(sortResults().length / resultsPerPage);

    // Function to get current results based on pagination
    const getCurrentResults = () => {
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    return sortResults().slice(start, end);
    };

    // Function to go to the previous page
    const goToPreviousPage = () => {
    if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
    }
    };

    // Function to go to the next page
    const goToNextPage = () => {
    if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
    }
    };
      


    /**
     * 
     * DISPLAY
     * 
     */

    // Display type
    const [displayType, setDisplayType] = useState("cards")


    // Function that handles rendering of results (handles pagination,displayType,sorting)
    const renderResults = () => {
        const start = (currentPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        const currentResults = sortResults().slice(start, end);
      
        switch (displayType) {
          case 'grid':
            return (
                <table className="table-auto w-full">
                    <thead className="bg-gray-300 text-black">
                    <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Subcategory</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentResults.map((result, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                        <td className="px-4 py-2">{result.name}</td>
                        <td className="px-4 py-2">{result.subcategory}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
          case 'list':
            return currentResults.map((result, index) => (
              <ListResult key={index} data={result} />
            ));
          case 'cards':
            return (
              <div className="grid grid-cols-3 gap-2">
                {currentResults.map((result, index) => (
                  <div key={index} className="w-full">
                    <CardResult data={result} />
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      };
      
    



    // Filter results by selected subcategories
    useEffect(() => {
        // If no subcategories are selected, show all results
        if (filters.category.length === 0) {
          setResults(data);
        } else {
          // Filter results by selected subcategories
          const filteredResults = data.filter((result) => {
            return filters.category.includes(result.subcategory);
          });
      
          setResults(filteredResults);
        }
    }, [filters]);




    return (
        <>
        



        {/* Image and Search Bar */}
        <div className="wildlife relative text-center">
            {/* Image */}
            <img
                src="http://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/inner5.jpg"
                alt="Wildlife"
                className="w-full"
            />
            {/* Search Bar */}
            <div className="absolute w-2/5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <SearchBar className=""/>
            </div>
        </div>

        
    
        {/* Search Results */}
        <div className="search-results flex mx-20 my-10 gap-5">

            {/* Filter Bar */}
            <div className="search-results__filters w-1/4">
                <FilterBar categories={categories} fields={fields} filters={filters} setFilters={setFilters}/>
                
            </div>

            {/* Search Results */}
            <div className="search-results__list w-3/4">

                <div className="flex flex-col">



                    {/* Results Nav - Display Type, Sorting, and Pagination */}
                    <div className="flex flex-row justify-between items-center p-3 rounded-md bg-light-blue bg-opacity-40 mb-4"
>

                        {/* Number of Results */}
                        <div className="">
                            <p className="text-gray-700">{results.length} results</p>
                        </div>

                        {/* Display Type Selection */}
                        <div className="flex items-center space-x-2">
                            <p className="text-gray-700">Display:</p>
                            <button className="display-button" onClick={() => setDisplayType('grid')}>Grid</button>
                            <button className="display-button" onClick={() => setDisplayType('list')}>List</button>
                            <button className="display-button" onClick={() => setDisplayType('cards')}>Cards</button>
                        </div>


                        {/* Sort By Selection */}
                        <div className="flex items-center space-x-2">
                            <p className="text-gray-700">Sort by:</p>
                            <select className="border border-solid border-gray-300 rounded px-2 py-1" onChange={handleSortByChange}>
                                <option value="none">None</option>
                                <option value="name">Name</option>
                            </select>
                        </div>

                        {/* Pagination Element */}
                        <div className="flex items-center space-x-2">
                        <p className="text-gray-700">Results per page:</p>
                        <select
                            className="border border-solid border-gray-300 rounded px-2 py-1"
                            value={resultsPerPage}
                            onChange={handleResultsPerPageChange}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                        </div>
                        <div className="flex items-center space-x-4">
                        <button
                            className="hover:bg-light-blue hover:text-white text-light-black font-bold py-2 px-4 rounded-full"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            {"<"}
                        </button>
                        <p className="text-gray-700">
                            {currentPage}/{totalPages}
                        </p>
                        <button
                            className="hover:bg-light-blue hover:text-white text-light-black font-bold py-2 px-4 rounded-full"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                        >
                            {">"}
                        </button>
                        </div>

                    </div>


                    {/* Results */}
                    <div className="text-left">
                    {renderResults()}
                    </div>

                </div>

                </div>
            </div>
        </>
    )
                }