import { SearchBar } from "../components/SearchBar"

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

    // List of results to display
    const results = [
        {}
    ]



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
                        return (
                            <div key={category.id}>
                                <hr class="my-2 border-t border-gray-300 w-3/4"/>
                                <div class="flex flex-row justify-between w-3/4">
                                    <label for="categoryFilter" class="text-lg font-bold">{category.label}</label>
                                    <button class="text-lg">+</button>
                                </div>
                                {/* Category subcategories */}
                                <div class="flex flex-col items-left">
                                    {category.subcategories.map((subcategory) => {
                                        return (
                                            <div key={subcategory}>
                                                <label for={subcategory}>{subcategory}</label>
                                            </div>
                                        )
                                    })}
                                </div>
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
                    <div className="flex flex-row justify-around">
                        {/* Number of Results */}
                        <div className="flex-1">
                            <p># results</p>
                        </div>
                        
                        {/* Sort by */}
                        <div className="flex">
                            <p>Sort by: </p>
                            <p>Alphabetical</p>
                        </div>

                        {/* Page Navigation */}
                        <div className="flex">
                            <button>{"<"}</button>
                            <p>1/12</p>
                            <button>{">"}</button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex flex-col">


                        {/* Result */}
                        <div className="flex flex-row border border-gray-300 p-4 rounded">
                            {/* Butterfly result */}
                            <img src="https://www.butterfliesandmoths.org/sites/default/files/styles/featured/public/featured/IMG_20190804_131724.jpg?itok=Z3Z3Z3Z3" alt="Butterfly" className="w-1/4"/>
                        </div>

                    </div>

                </div>
            </div>
        </div>
        </>
    )
}