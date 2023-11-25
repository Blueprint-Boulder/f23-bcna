import { ActionButton } from "./ActionButton"

export const SearchBar = () => {
    return (
        <div className="searchbar flex items-center rounded-md overflow-hidden bg-white">
        <input
            type="text"
            placeholder="Search..."
            className="flex-grow p-2 border-none focus:outline-none"
        />
        <ActionButton className="rounded-r-md">Search</ActionButton>
        </div>
    )
}