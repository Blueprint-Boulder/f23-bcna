import { useEffect, useState } from "react";

export const FilterBar = ({ categories, fields, filters, setFilters }) => {
    
    // Expanded filters are the expandable rows in the filter bar, including Category and shared fields between results
    const [expandedFilters, setExpandedFilters] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);


    /* ------------------------------------------------------------------------------------------
                                HELPER FUNCTIONS
    ------------------------------------------------------------------------------------------ */

  

    // Helper function that capitalizes the first letter of a word
    function capitalizeFirstLetter(word) {
        // Check if the input is a string and not empty
        if (typeof word !== 'string' || word.length === 0) {
            return word; // Return the input unchanged if it's not a string or empty
        }
        
        // Capitalize the first letter and concatenate it with the rest of the word
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // When selecting expand button on filter row, will update expandedFilters
    const handleExpandFilter = (filterName) => {
        if (expandedFilters.includes(filterName)) {
            setExpandedFilters(expandedFilters.filter((filter) => filter !== filterName));
        } else {
            setExpandedFilters([...expandedFilters, filterName]);
        }
        // CULPRIT
        console.log(`handle expand filter ${filterName}`)
        console.log(filters)
    };

    // Recurses through wildlife categories to find category with given id
    const findCategoryById = (categoryArray, id) => {
        for (let category of categoryArray) {
            if (category.id === id) {
                return category;
            }
            if (category.subcategories.length > 0) {
                const subcategory = findCategoryById(category.subcategories, id);
                if (subcategory) {
                    return subcategory;
                }
            }
        }
        return null;
    };

    const findParentCategory = (categories, categoryId) => {
        for (let category of categories) {
            // Check if the current category's subcategories include the categoryId
            if (category.subcategories.some(subcategory => subcategory.id === categoryId)) {
                // If found, return the current category
                return category;
            }
            // If the category has subcategories, recursively search them
            if (category.subcategories.length > 0) {
                const parentCategory = findParentCategory(category.subcategories, categoryId);
                if (parentCategory) {
                    return parentCategory;
                }
            }
        }
        // If no parent category found, return null
        return null;
    };
    


    /* ------------------------------------------------------------------------------------------
                                    Categories  
    ------------------------------------------------------------------------------------------ */

  
    
    const selectCategory = (categoryId) => {
        console.log('SELECT CATEGORY!')
        const updatedFilters = { ...filters };
        const updatedSelectedCategories = [...selectedCategories]; // Copy the selectedCategories array
        const category = findCategoryById(categories, categoryId);
        if (category) {
            // Add the selected category ID to filters
            if (!updatedFilters.category.includes(categoryId)){
                updatedFilters.category.push(categoryId);
            } 
            if(!updatedSelectedCategories.includes(categoryId)) {
                updatedSelectedCategories.push(categoryId);
            }
    
            // Add all subcategories (children) to updatedFilters.category recursively
            const addSubcategories = (subcategories) => {
                subcategories.forEach((subcategory) => {
                    updatedFilters.category.push(subcategory.id); // Add the subcategory ID to filters
                    if (subcategory.subcategories.length > 0) {
                        addSubcategories(subcategory.subcategories); // Recursively add subcategories
                    }
                });
            };
            addSubcategories(category.subcategories);
    
            // Get parent category of category and go through the category's siblings
            const parentCategory = findParentCategory(categories, categoryId);
            if (parentCategory) {
                parentCategory.subcategories.forEach((sibling) => {
                    // If sibling is in both selectedCategories and filters.categories, keep sibling in filters.categories
                    if (updatedSelectedCategories.includes(sibling.id) && !updatedFilters.category.includes(sibling.id)) {
                        updatedFilters.category.push(sibling.id);
                    }
                    // If sibling is in filters.categories but not in selectedCategories, remove sibling from filters.categories
                    if (!updatedSelectedCategories.includes(sibling.id) && updatedFilters.category.includes(sibling.id)) {
                        updatedFilters.category = updatedFilters.category.filter((catId) => catId !== sibling.id);
                    }
                });
            }
        }
        // Update the filters with the new list of category IDs
        setFilters(updatedFilters);
        // Update the selectedCategories state
        setSelectedCategories(updatedSelectedCategories);
        console.log('Filter categories:')
        console.log(updatedFilters);
        console.log('Selected categories:')
        console.log(updatedSelectedCategories)
    };
    
    


    // Handles deselection of category filter - deselects category AS WELL AS its subcategories
    const deselectCategory = (categoryId) => {
        const updatedFilters = { ...filters };
        const category = findCategoryById(categories, categoryId);
    
        if (category) {
            // Remove the category and its subcategories from filters.category
            updatedFilters.category = updatedFilters.category.filter((catId) => catId !== categoryId);
            const deselectSubcategories = (subcategories) => {
                subcategories.forEach((subcategory) => {
                    updatedFilters.category = updatedFilters.category.filter((catId) => catId !== subcategory.id);
                    if (subcategory.subcategories.length > 0) {
                        deselectSubcategories(subcategory.subcategories);
                    }
                });
            };
            deselectSubcategories(category.subcategories);
    
            // Remove the category and its subcategories from selectedCategories
            let updatedSelectedCategories = [...selectedCategories].filter((catId) => catId !== categoryId);
            const deselectSubcategoriesFromSelected = (subcategories) => {
                subcategories.forEach((subcategory) => {
                    updatedSelectedCategories = updatedSelectedCategories.filter((catId) => catId !== subcategory.id);
                    if (subcategory.subcategories.length > 0) {
                        deselectSubcategoriesFromSelected(subcategory.subcategories);
                    }
                });
            };
            deselectSubcategoriesFromSelected(category.subcategories);
    
            // Update the state with the updated filters and selectedCategories
            setFilters(updatedFilters);
            setSelectedCategories(updatedSelectedCategories);
            console.log('Filter categories:')
            console.log(updatedFilters);
            console.log('Selected categories:')
            console.log(updatedSelectedCategories)
        }
    };
    

    

    // Renders categoryies and their subcategories recursively and adds styling to indicate hierarchy
    const renderCategoryFilters = (categories, level) => {
        const marginLeft = 10 * level;
    
        return (
            <div className="flex flex-col">
                {categories.map((category) => (
                    <div key={category.id} style={{ marginLeft: `${marginLeft}px` }}>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    if (isChecked) {
                                        selectCategory(category.id);
                                    } else {
                                        deselectCategory(category.id);
                                    }
                                }}
                                checked={selectedCategories.includes(category.id)}
                                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out checked:bg-light-blue"
                            />
                            <label className="ml-2 text-gray-700">{category.name}</label>
                        </div>
                        {filters.category.includes(category.id) && category.subcategories.length > 0 && renderCategoryFilters(category.subcategories, level + 1)}
                    </div>
                ))}
            </div>
        );
    };



    /* ------------------------------------------------------------------------------------------
                                        FIELDS
    ------------------------------------------------------------------------------------------ */

  

    // When option under shared field is selected, updates filters
    const toggleFieldFilter = (field, option) => {
        // Make a copy of the current filters object
        const updatedFilters = { ...filters };
        
        // Convert the field to lowercase
        const lowercaseField = field.toLowerCase();
        
        // Initialize the field array if it doesn't exist
        if (!updatedFilters[lowercaseField]) {
            updatedFilters[lowercaseField] = [];
        }
        
        // Find the index of the option in the array
        const index = updatedFilters[lowercaseField].indexOf(option);
        
        if (index !== -1) {
            // If the option is selected, remove it
            updatedFilters[lowercaseField].splice(index, 1);
            
            // If the array is empty after removal, delete the key from filters
            if (updatedFilters[lowercaseField].length === 0) {
                delete updatedFilters[lowercaseField];
            }
        } else {
            // If the option is not selected, add it
            updatedFilters[lowercaseField].push(option);
        }
        
        // Update the state with the updated filters object
        setFilters(updatedFilters);
        console.log(updatedFilters)
    };
    
    

    const handleResetFilters = () => {
        // Set the filters back to the initial state
        // Assuming the initial state of filters is an object with an empty array for `category`
        setFilters({
            category: [],
            // If there are other filter types, you can reset them as well
            // color: [],
            // location: [],
            // ...
        });
        
        // Also, if you have expanded filters you want to collapse, reset them as well
        setExpandedFilters([]);
    }
    
    
      


    // Renders shared fields as well as their respective options
    const renderFieldFilters = () => {
        return fields.map((field) => (
            <div key={field.id}>
                <hr className="my-2 border-t border-gray-300 w-3/4" />
                <div className="flex flex-row justify-between w-3/4">
                    <h5 className="text-lg font-bold">{capitalizeFirstLetter(field.name)}</h5>
                    <button className="text-lg" onClick={() => handleExpandFilter(field.name)}>
                        {expandedFilters.includes(field.name) ? "-" : "+"}
                    </button>
                </div>
                {expandedFilters.includes(field.name) && (
                    <div className="flex flex-col w-3/4">
                        {field.options.map((option) => (
                            <label className="flex items-center" key={option}>
                                {/* Ensure onChange passes event parameter */}
                                <input 
                                    type="checkbox" 
                                    className="form-checkbox" 
                                    onChange={(e) => toggleFieldFilter(field.name, option, e.target.checked)} 
                                    // Check if option is included in filters[field.name]
                                    checked={filters[field.name] && filters[field.name].includes(option)}
                                />
                                <span className="ml-2">{capitalizeFirstLetter(option)}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        ));
    };


    /* ------------------------------------------------------------------------------------------
                                    Render Display 
    ------------------------------------------------------------------------------------------ */

  

      

    // If no categories or fields defined, no FilterBar returned
    if(categories === undefined && fields === undefined){
        return (null)
    }

    // FilterBar
    return (
        <div class="flex flex-col items-left text-left">
            <div class="my-2">
                <h3 class="text-lg font-bold">Filter by</h3>
            </div>

            <div className="flex flex-col">
                <hr class="my-2 border-t border-gray-300 w-3/4" />
                <div class="flex flex-row justify-between w-3/4">
                    <h5 for="categoryFilter" class="text-lg font-bold">
                        Category
                    </h5>
                    <button class="text-lg" onClick={() => handleExpandFilter("Category")}>
                        {expandedFilters.includes("Category") ? "-" : "+"}
                    </button>
                </div>
                {expandedFilters.includes("Category") ? renderCategoryFilters(categories, 1) : null}
            </div>

            <div>{renderFieldFilters()}</div>

            <br/>

            <button 
            className="text-left underline text-gray-600"
            onClick={handleResetFilters}>
                Reset all filters
            </button>
        </div>
    );
};
