import { useState } from "react";
import { ActionButton } from "./ActionButton";

export const SearchBar = () => {
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setResults] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    // Example function to simulate fetching/searching data
    // In a real app, you might fetch data from an API
    const search = (query) => {
        // Simulated search results
        const simulatedResults = [
            { name: "Page 1", url: "/page1" },
            { name: "Page 2", url: "/page2" },
            // Add more simulated results as needed
        ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

        setResults(simulatedResults);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (value.trim() !== "") {
            setIsTyping(true);
            search(value); // Simulate a search operation
        } else {
            setIsTyping(false);
            setResults([]); // Clear results when input is empty
        }
    };

    return (
        <div className="absolute w-full">
            <div className="searchbar flex items-center rounded-md overflow-hidden bg-white">
                <input
                    type="text"
                    placeholder="Search..."
                    className="flex-grow p-2 border-none focus:outline-none"
                    onChange={handleChange}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                />
                <ActionButton className="rounded-r-md">Search</ActionButton>
            </div>
            {isTyping && searchResults.length > 0 && (
                <div className="searchbar-results absolute top-full mt-1 w-full bg-white shadow-md rounded-md p-2 z-10 divide-y divide-gray-200">
                    {searchResults.map((item, index) => (
                        <a key={index} href={item.url} className="flex items-center p-2 hover:bg-gray-100 last:border-b-0">
                            {item.name}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};
