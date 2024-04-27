import React, { useEffect, useState } from "react";

export const FilterBar = ({ categories, fields, filters, setFilters }) => {
    // State for selected categories
    const [selectedCategories, setSelectedCategories] = useState([]);

    // State for shared fields
    const [sharedFields, setSharedFields] = useState([]);

    // State for expanded filters
    const [expandedFilters, setExpandedFilters] = useState([]);

    // useEffect to call updateSharedFields whenever selectedCategories changes
    useEffect(() => {
        updateSharedFields();
    }, [selectedCategories]);

    useEffect(() => {
        console.log("selected categories:")
        console.log(selectedCategories)
        console.log("filters")
        console.log(filters)
    },[filters,selectedCategories])


    // Helper function to capitalize the first letter of a word
    function capitalizeFirstLetter(word) {
        if (typeof word !== 'string' || word.length === 0) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Handler for expanding/collapsing filter rows
    const handleExpandFilter = (filterName) => {
        if (expandedFilters.includes(filterName)) {
            setExpandedFilters(expandedFilters.filter((filter) => filter !== filterName));
        } else {
            setExpandedFilters([...expandedFilters, filterName]);
        }
    };



    // Create a hashmap of category objects using their ids
    const idToCategoryMap = categories.reduce((map, category) => {
        map[category.id] = category;
        return map;
    }, {});

    
    const findCategoryById = (categoryId) => {
        // Check if the category object exists in the idToCategoryMap
        if (idToCategoryMap[categoryId]) {
            return idToCategoryMap[categoryId];
        }
        // If not found, return undefined
        return undefined;
    };
    
    
    
    
    
    
    






    const selectCategory = (categoryId) => {
        console.log(`Selected ${categoryId}`)
        // Make a copy of filters and selected categories
        const updatedFilters = { ...filters };
        const updatedSelectedCategories = [...selectedCategories];
    
        // Find the category selected in categories array
        const category = findCategoryById(categoryId);

        console.log(category)
    
        // If category exists, add its subcategories recursively to filters and handle siblings' filters
        if (category) {
            // If updated filters doesn't include category, add it
            if (!updatedFilters.category.includes(categoryId)) {
                updatedFilters.category.push(categoryId);
            }
    
            // If updated selected categories doesn't include category, add it
            if (!updatedSelectedCategories.includes(categoryId)) {
                updatedSelectedCategories.push(categoryId);
            }
    
            // Recursively add category's subcategories to updated filters
            const addSubcategories = (subcategories) => {
                subcategories.forEach((subcategoryId) => {
                    // Find the category object by its ID
                    const subcategory = findCategoryById(subcategoryId);
                    if (subcategory) {
                        updatedFilters.category.push(subcategory.id);
                        // If the subcategory has subcategories, recurse with the subcategories array
                        if (subcategory.subcategories && subcategory.subcategories.length > 0) {
                            addSubcategories(subcategory.subcategories);
                        }
                    }
                });
            };
    
            addSubcategories(category.subcategories);
    
            // Get parent category
            const parentCategory = findCategoryById(category.parent_id);
    
            // If parent category found, update the siblings of category selected accordingly
            if (parentCategory) {
                // For each sibling / subcategory of category's parent:
                parentCategory.subcategories.forEach((sibling) => {
                    // If sibling in selected categories but not in filters, add sibling to filters
                    if (updatedSelectedCategories.includes(sibling) && !updatedFilters.category.includes(sibling)) {
                        updatedFilters.category.push(sibling);
                    }
                    // If sibling not selected but in filters, remove it from filter
                    if (!updatedSelectedCategories.includes(sibling) && updatedFilters.category.includes(sibling)) {
                        updatedFilters.category = updatedFilters.category.filter((catId) => catId !== sibling);
                    }
                });
            }
    
            setFilters(updatedFilters);
            setSelectedCategories(updatedSelectedCategories);
        }
    };
    
    const deselectCategory = (categoryId) => {


        // Make a copy of filters
        const updatedFilters = { ...filters };
    
        // Get category that's deselected
        const category = findCategoryById(categoryId);
    
        // If category exists, handle logic accordingly
        if (category) {
            // Get rid of category from filters
            updatedFilters.category = updatedFilters.category.filter((catId) => catId !== categoryId);
    
            // Remove every subcategory of category from filters recursively
            const deselectSubcategories = (subcategories) => {
                subcategories.forEach((subcategoryId) => {
                    // Find the category object by its ID
                    const subcategory = findCategoryById(subcategoryId);
                    if (subcategory) {
                        updatedFilters.category = updatedFilters.category.filter((catId) => catId !== subcategory.id);
                        // If the subcategory has subcategories, recursively deselect them
                        if (subcategory.subcategories && subcategory.subcategories.length > 0) {
                            deselectSubcategories(subcategory.subcategories);
                        }
                    }
                });
            };
    
            deselectSubcategories(category.subcategories || []);
    
            // Get rid of category from selected categories
            let updatedSelectedCategories = [...selectedCategories].filter((catId) => catId !== categoryId);
    
            // Deselect every subcategory of category recursively
            const deselectSubcategoriesFromSelected = (subcategories) => {
                subcategories.forEach((subcategory) => {
                    updatedSelectedCategories = updatedSelectedCategories.filter((catId) => catId !== subcategory);
                    if (subcategory.subcategories && subcategory.subcategories.length > 0) {
                        deselectSubcategoriesFromSelected(subcategory.subcategories);
                    }
                });
            };
            deselectSubcategoriesFromSelected(category.subcategories || []);
    
            // Get parent of category
            const parentCategory = findCategoryById(category.parent_id);
    
            // If parent exists and all siblings are deselected, add all siblings to filters (just not selected filters)
            if (parentCategory) {
                const allSiblingsDeselected = parentCategory.subcategories.every((sibling) => !updatedFilters.category.includes(sibling));
                if (allSiblingsDeselected) {
                    const addSubcategoryIds = (subcategories) => {
                        subcategories.forEach((subcategory) => {
                            updatedFilters.category.push(subcategory);
                            if (subcategory.subcategories && subcategory.subcategories.length > 0) {
                                addSubcategoryIds(subcategory.subcategories);
                            }
                        });
                    };
                    addSubcategoryIds(parentCategory.subcategories);
                }
            }
    
            setFilters(updatedFilters);
            setSelectedCategories(updatedSelectedCategories);
        }
    };
    
    

    // Helper function to update shared fields based on selected categories
    const updateSharedFields = () => {
        const fieldCount = {};
        selectedCategories.forEach(categoryId => {
            const category = findCategoryById(categoryId);
            if (category) {
                category.field_ids.forEach(fieldId => {
                    fieldCount[fieldId] = (fieldCount[fieldId] || 0) + 1;
                });
            }
        });
        const newSharedFields = fields.filter(field => fieldCount[field.id] === selectedCategories.length);
        setSharedFields(newSharedFields);
    };

    // Helper function to handle toggling of field filters
    // const toggleFieldFilter = (field, option, value) => {
        
    // };


    // Helper function to reset all filters
    const handleResetFilters = () => {
        setSelectedCategories([]);
        setSharedFields([]);
        setFilters({ category: [] });
        setExpandedFilters([]);
    };

    const renderCategoryFilters = (categories, level) => {
        const marginLeft = 10 * level;
        return (
            <div className="flex flex-col">
                {/* Render categories */}
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
                        {/* Render subcategories if category is selected and has subcategories */}
                        {(filters.category.includes(category.id) || selectedCategories.includes(category.id)) && category.subcategories.length > 0 && (
                            <div className="ml-8">
                                {/* Recursively render subcategories */}
                                {category.subcategories.map((subcategoryId) => {
                                    // Find the subcategory by its ID
                                    const subcategory = findCategoryById(subcategoryId);
                                    // Check if the subcategory exists before rendering
                                    return subcategory && renderCategoryFilters([subcategory], level + 1);
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };
    






    // Helper function to render field filters
    const renderFieldFilters = () => {
        return sharedFields.map((field) => (
            <div key={field.id}>
                <div className="flex flex-row justify-between w-3/4">
                    <h5 className="text-lg font-bold">{capitalizeFirstLetter(field.name)}</h5>
                    <button className="text-lg" onClick={() => handleExpandFilter(field.name)}>
                        {expandedFilters.includes(field.name) ? "-" : "+"}
                    </button>
                </div>
                {expandedFilters.includes(field.name) && (
                    <div className="flex flex-col w-3/4">
                        {/* Check if the field type is INTEGER or other */}
                        {field.type === "INTEGER" ? (
                            <div className="flex items-center p-3">
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const updatedFilters = { ...filters };
                                        const fieldId = field.id;
                                        const lowercaseField = field.name ? field.name.toLowerCase() : "";
                            
                                        if (!updatedFilters[lowercaseField]) {
                                            updatedFilters[lowercaseField] = {};
                                        }
                            
                                        updatedFilters[lowercaseField]["range"] = [
                                            value,
                                            filters[lowercaseField]?.["range"]?.[1] || "min"
                                        ];
                            
                                        setFilters(updatedFilters);
                                    }} 
                                    value={filters[field.name]?.["range"]?.[0] || ""} 
                                    className="form-input w-1/2 mr-2" 
                                />
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const updatedFilters = { ...filters };
                                        const fieldId = field.id;
                                        const lowercaseField = field.name ? field.name.toLowerCase() : "";
                            
                                        if (!updatedFilters[lowercaseField]) {
                                            updatedFilters[lowercaseField] = {};
                                        }
                            
                                        updatedFilters[lowercaseField]["range"] = [
                                            filters[lowercaseField]?.["range"]?.[0] || "max",
                                            value
                                        ];
                            
                                        setFilters(updatedFilters);
                                    }} 
                                    value={filters[field.name]?.["range"]?.[1] || ""} 
                                    className="form-input w-1/2" 
                                />
                            </div>
                        
                        ) : (
                            // Render checkboxes for other types
                            field.options.map((option) => (
                                <label className="flex items-center" key={option}>
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox" 
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            const updatedFilters = { ...filters };
                                            const fieldId = field.id;
                                            const lowercaseField = field.name ? field.name.toLowerCase() : "";

                                            if (!updatedFilters[lowercaseField]) {
                                                updatedFilters[lowercaseField] = {};
                                            }

                                            updatedFilters[lowercaseField][option] = isChecked;

                                            setFilters(updatedFilters);
                                        }} 
                                        checked={filters[field.name] && filters[field.name][option]} // Assuming the field name is lowercase
                                    />
                                    <span className="ml-2">{capitalizeFirstLetter(option)}</span>
                                </label>
                            ))
                        )}
                    </div>
                )}
                <hr className="my-2 border-t border-gray-300 w-3/4" />
            </div>
        ));
    };

















    // Render the component
    return (
        <div className="flex flex-col items-left text-left">
            <div className="my-2">
                <h3 className="text-lg font-bold">Filter by</h3>
            </div>

            <div className="flex flex-col">
                <hr className="my-2 border-t border-gray-300 w-3/4" />
                <div className="flex flex-row justify-between w-3/4">
                    <h5 htmlFor="categoryFilter" className="text-lg font-bold">
                        Category
                    </h5>
                    <button className="text-lg" onClick={() => handleExpandFilter("Category")}>
                        {expandedFilters.includes("Category") ? "-" : "+"}
                    </button>
                </div>
                {expandedFilters.includes("Category") ? renderCategoryFilters(categories.filter(category => category.parent_id === null), 1) : null}
                <hr className="my-2 border-t border-gray-300 w-3/4" />
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
}
