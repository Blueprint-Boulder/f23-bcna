import { useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { FilterBar } from "../components/FilterBar";
import { GridResult, ListResult, CardResult } from "../components/ResultTypes";
import apiService from "../services/apiService";

export const Wildlife = () => {
  const [wildlifeData, setWildlifeData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState([]);
  const [results, setResults] = useState([]);
  const [displayType, setDisplayType] = useState("cards");
  const [filters, setFilters] = useState({ category: [] });
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(5);

  const convertDataToArray = (data) => {
    return Object.keys(data).map((key) => data[key]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesAndFields = await apiService.getCategoriesAndFields();
        const data = await apiService.getAllWildlife();

        const fetchedWildlife = convertDataToArray(data);
        const fetchedCategories = convertDataToArray(
          categoriesAndFields.categories
        );
        const fetchedFields = convertDataToArray(categoriesAndFields.fields);

        // Fetch image URLs for each result
        // const updatedData = await Promise.all(
        //   fetchedWildlife.map(async (result) => {
        //     if (result.field_values) {
        //       const thumbnailField = fetchedFields.find(
        //         (field) => field.name === "Thumbnail"
        //       );
        //       if (thumbnailField) {
        //         console.log(`thumbnail field :`)
        //         console.log(thumbnailField)
        //         const thumbnailValue = result.field_values.find(
        //           (field) => field.field_id === thumbnailField.id
        //         );
        //         if (thumbnailValue) {
        //             console.log(`thubmnail value:`,thumbnailValue)
        //           try {
        //             // Fetch image using apiService
        //             const response = await apiService.getImage(thumbnailValue.value);
        //             console.log(`Response : `, response)

        //             return { ...result, image: null };
        //           } catch (error) {
        //             console.error("Error fetching image:", error);
        //           }
        //         }
        //       }
        //     }
        //     return result;
        //   })
        // );
        setWildlifeData(fetchedWildlife); // Set the updated data with image URLs
        setCategories(fetchedCategories);
        setFields(fetchedFields);
      } catch (error) {
        console.error("Error fetching wildlife data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filteredResults = [...wildlifeData];

      // Filter by category
      if (filters.category.length > 0) {
        filteredResults = filteredResults.filter((result) =>
          filters.category.includes(result.category_id)
        );
      }

      if (filters.fields) {
        // Filter by field filters
        Object.keys(filters.fields).forEach((fieldId) => {
          const fieldFilterValues = filters.fields[fieldId].filterValues;
          if (fieldFilterValues.length > 0) {
            console.log(
              `Filtering by field ${fieldId} with values:`,
              fieldFilterValues
            );
            filteredResults = filteredResults.filter((result) =>
              result.field_values.some((fieldValue) => {
                const isMatch =
                  fieldValue.field_id === parseInt(fieldId) &&
                  fieldFilterValues.includes(fieldValue.value);
                return isMatch;
              })
            );
          }
        });
      }

      // Sort results
      switch (sortBy) {
        case "name":
          filteredResults.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
        // No sorting
      }

      setResults(filteredResults);
    };

    applyFilters();
  }, [wildlifeData, filters, sortBy]);

  const totalPages = Math.ceil(results.length / resultsPerPage);

  const renderResults = () => {
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const currentResults = results.slice(start, end);

    if (currentResults.length === 0) {
      return <p>No results found.</p>;
    }

    switch (displayType) {
      case "grid":
        return (
          <table className="table-auto w-full">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Subcategory</th>
              </tr>
            </thead>
            <tbody>
              {currentResults.map((result, index) => (
                <GridResult key={index} data={result} />
              ))}
            </tbody>
          </table>
        );
      case "list":
        return currentResults.map((result, index) => (
          <ListResult key={index} data={result} />
        ));
      case "cards":
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

  const handleResultsPerPageChange = (event) => {
    setResultsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <div className="wildlife relative text-center">
        <img src="/searchBackground.jpg" alt="Wildlife" className="w-full" />
        <div className="absolute w-2/5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <SearchBar className="" />
        </div>
      </div>
      <div className="search-results flex mx-20 my-10 gap-5">
        {categories && (
          <div className="search-results__filters w-1/4">
            <FilterBar
              wildlife={wildlifeData}
              categories={categories}
              fields={fields}
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        )}
        <div className="search-results__list w-3/4">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-center p-3 rounded-md bg-light-blue bg-opacity-40 mb-4">
              <div className="">
                <p className="text-gray-700">{results.length} results</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-gray-700">Display:</p>
                <button
                  className="display-button"
                  onClick={() => setDisplayType("grid")}
                >
                  Grid
                </button>
                <button
                  className="display-button"
                  onClick={() => setDisplayType("list")}
                >
                  List
                </button>
                <button
                  className="display-button"
                  onClick={() => setDisplayType("cards")}
                >
                  Cards
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-gray-700">Sort by:</p>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-gray-700">Results per page:</p>
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={resultsPerPage}
                    onChange={handleResultsPerPageChange}
                  >
                    <option value={1}>1</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
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
          <div className="text-left">{renderResults()}</div>
        </div>
      </div>
    </>
  );
};
