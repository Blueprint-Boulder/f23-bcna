import { SearchBar } from "../components/SearchBar"
import Card from "../components/Card"
import Filters from "../components/Filters"

export const Wildlife = () => {

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
            <Filters />
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