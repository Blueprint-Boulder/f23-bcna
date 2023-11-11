import { SearchBar } from "../components/SearchBar"

export const Wildlife = () => {
    return (
        <div className="wildlife relative text-center">
        <img
            src="http://coloradofrontrangebutterflies.com/wp-content/uploads/2016/02/inner5.jpg"
            alt="Wildlife"
            className="block mx-auto mb-4"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
            <SearchBar/>
        </div>
        </div>
    )
}