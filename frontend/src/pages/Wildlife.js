import { useEffect, useState, useMemo } from "react"

import { SearchBar } from "../components/SearchBar"
import { FilterBar } from "../components/FilterBar"
import { GridResult, ListResult, CardResult } from "../components/ResultTypes"

import apiService from "../services/apiService"

export const Wildlife = () => {

    // Dummy data for testing
    const data = [
        {
            id: 0,
            name: "Two-Tailed Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2022/09/Swallowtail_Two-tailed_CFriedman.jpg",
            category_id: 4,
            color: "yellow",
            location: "boulder"
        },
        {
            id: 1,
            name: "Western Tiger Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/WESTERN_TIGER_SWALLOWTAIL1.jpe",
            category_id: 4,
            color : "yellow",
            location: "longmont"
        },
        {
            id: 2,
            name: "Black Swallowtail",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2022/10/Swallowtail_Black-female_SJones.jpg",
            category_id: 4,
            color: "black",
            location : "longmont"
        },
        {
            id: 3,
            name: "Pine White",
            subcategory: "Invertebrate",
            image: "https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/PINE_WHITE1.jpe",
            category_id: 4,
            color: "white",
            location : "boulder"
        },
        {
            id: 3,
            name: "Arctic Fox",
            subcategory: "Invertebrate",
            image: "https://cdn.britannica.com/23/178223-050-2EA8AA51/Arctic-fox.jpg",
            category_id: 3,
            color: "white",
            location : "boulder"
        },
        {
            id: 3,
            name: "Red Fox",
            subcategory: "Invertebrate",
            image: "https://cdn.britannica.com/95/206395-050-02B81B30/Red-fox-Vulpes-vulpes.jpg",
            category_id: 3,
            color: "red",
            location : "boulder"
        },
    ]



    // List of categories to filter by with their respective keys and subcategories
    const categoriesAndFields = useMemo(() => (
        {
            "categories": [
                {
                    "id" : 1,
                    "field_ids": [1, 2],
                    "name": "Animals",
                    "subcategories": [
                        {
                            "id" : 2,
                            "field_ids": [3, 1, 2],
                            "name": "Birds",
                            "subcategories": [
                                {
                                    "id" : 5,
                                    "field_ids" : [],
                                    "name" : "Sparrows",
                                    "subcategories" : []
                                },
                                {
                                    "id" : 6,
                                    "field_ids" : [],
                                    "name" : "Ostriches",
                                    "subcategories" : []
                                },
                            ]
                        },
                        {
                            "id" : 3,
                            "field_ids": [1, 2],
                            "name": "Cats",
                            "subcategories": []
                        }
                    ]
                }
            ],
            "fields": [
                {
                    "id": 1,
                    "name": "Color",
                    "type": "TEXT",
                    "options": ["red","white","black","yellow"]
                },
                {
                    "id": 2,
                    "name": "Location",
                    "type": "TEXT",
                    "options" : ["boulder","longmont"]
                },
                {
                    "id": 3,
                    "name": "Wingspan",
                    "type": "INTEGER",
                    "options" : []
                }
            ]
        }
), []
    )
    const [categories,setCategories] = useState([])
    const [fields,setFields] = useState([])
    const [results, setResults] = useState(data)
    const [displayType, setDisplayType] = useState("cards")
    const [filters, setFilters] = useState({
        category: [],
    })
    const [sortBy,setSortBy] = useState('name')
    // Current page and results per page states
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(5); // Number of results per page


    // Fetch categories and fields only once when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                //const { categories, fields } = await apiService.getCategoriesAndFields();
                setCategories(categoriesAndFields.categories);
                setFields(categoriesAndFields.fields);
            } catch (error) {
                console.error("Error fetching categories and fields:", error);
            }
        };

        fetchData();

        // Cleanup function not needed as it's not relevant here
    }, []);


    /**
     * 
     * SORTING
     * 
     */




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
    

    
    // Function to handle the change in number of results per page
    const handleResultsPerPageChange = (event) => {
        setResultsPerPage(parseInt(event.target.value));
        setCurrentPage(1); // Reset to first page when changing results per page
    };

    // Function to get total number of pages
    const totalPages = Math.ceil(sortResults().length / resultsPerPage);


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

    
    // Function that handles rendering of results (handles pagination,displayType,sorting)
    const renderResults = () => {


        // Filter results based on selected category
        let filteredResults = [...data];
        if (filters.category.length > 0) {
            filteredResults = filteredResults.filter(result => filters.category.includes(result.category_id));
        }
    
        // Filter results based on other filters (color and location)
        for (const filterKey in filters) {
            if (filterKey !== 'category') {
                filteredResults = filteredResults.filter(result => filters[filterKey].length === 0 || filters[filterKey].includes(result[filterKey]));
            }
        }
    
        // Pagination and sorting
        const start = (currentPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        const currentResults = sortResultsByName(filteredResults).slice(start, end);

        if(currentResults.length === 0){
            return (
                <p>No results found.</p>
            )
        }
    
        // Render results based on display type
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
            { categoriesAndFields !== undefined ?
                <div className="search-results__filters w-1/4">
                    <FilterBar categories={categories} fields={fields} filters={filters} setFilters={setFilters}/>
                </div>
                : null
            }

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
                        <div className="flex items-center space-x-1">
                            <p className="text-gray-700">Sort by:</p>
                            <div className="relative">
                                <select className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                    <option value="name">Name</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10.707 14.293a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L10 12.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            </div>
                        </div>

                        {/* Pagination Element */}
                        <div className="flex items-center space-x-1">
                            <p className="text-gray-700">Results per page:</p>
                            <div className="relative">
                                <select
                                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    value={resultsPerPage}
                                    onChange={handleResultsPerPageChange}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10.707 14.293a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L10 12.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4z" clip-rule="evenodd" />
                                </svg>
                            </div>
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