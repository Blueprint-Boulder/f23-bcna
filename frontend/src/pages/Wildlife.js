import { SearchBar } from "../components/SearchBar"
import Card from "../components/Card"

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
        <div className="absolute w-4/5 lg:w-1/2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SearchBar className=""/>
        </div>
        </div>
        {/* Search Results */}
        <div className="search-results flex mx-5 md:mx-20 my-10 gap-5">
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
                                    <button className="text-lg">+</button>
                                </div>
                                {/* Category subcategories */}
                                <div className="flex flex-col items-left">
                                    {category.subcategories.map((subcategory) => {
                                        return (
                                            <div key={subcategory}>
                                                <label htmlFor={subcategory}>{subcategory}</label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                    {/* Final Horizontal Line */}
                    <hr className="my-2 border-t border-gray-300 w-3/4"/>




                </div>
            </div>
            {/* Search Results */}
            <div className="search-results__list w-full md:w-3/4">
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
                        <Card 
                            image="https://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/WESTERN_TIGER_SWALLOWTAIL1.jpe"
                            name="Western Tiger Swallowtail"
                            scientificName="Papilio rutulus"
                            family="Swallowtails"
                            description="boldly colored black and yellow with four broad black stripes crossing the forewing and the innermost stripe continuing across the hindwing. The trailing edges of both wings have broad black margins with yellow crescents."
                        />
                    </div>

                </div>
            </div>
        </div>
        </>
    )
}