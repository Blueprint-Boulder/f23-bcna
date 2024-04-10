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
        console.log("filters:")
        console.log(filters)
    },[filters])

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
            if (category.subcategories.some(subcategory => subcategory.id === categoryId)) {
                return category;
            }
            if (category.subcategories.length > 0) {
                const parentCategory = findParentCategory(category.subcategories, categoryId);
                if (parentCategory) {
                    return parentCategory;
                }
            }
        }
        return null;
    };

    const selectCategory = (categoryId) => {
        const updatedFilters = { ...filters };
        const updatedSelectedCategories = [...selectedCategories];
        const category = findCategoryById(categories, categoryId);
        if (category) {
            if (!updatedFilters.category.includes(categoryId)){
                updatedFilters.category.push(categoryId);
            } 
            if(!updatedSelectedCategories.includes(categoryId)) {
                updatedSelectedCategories.push(categoryId);
            }

            const addSubcategories = (subcategories) => {
                subcategories.forEach((subcategory) => {
                    updatedFilters.category.push(subcategory.id);
                    if (subcategory.subcategories.length > 0) {
                        addSubcategories(subcategory.subcategories);
                    }
                });
            };
            addSubcategories(category.subcategories);

            const parentCategory = findParentCategory(categories, categoryId);
            if (parentCategory) {
                parentCategory.subcategories.forEach((sibling) => {
                    if (updatedSelectedCategories.includes(sibling.id) && !updatedFilters.category.includes(sibling.id)) {
                        updatedFilters.category.push(sibling.id);
                    }
                    if (!updatedSelectedCategories.includes(sibling.id) && updatedFilters.category.includes(sibling.id)) {
                        updatedFilters.category = updatedFilters.category.filter((catId) => catId !== sibling.id);
                    }
                });
            }
        }
        setFilters(updatedFilters);
        setSelectedCategories(updatedSelectedCategories);
    };

    const deselectCategory = (categoryId) => {
        const updatedFilters = { ...filters };
        const category = findCategoryById(categories, categoryId);

        if (category) {
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

            const parentCategory = findParentCategory(categories, categoryId);
            if (parentCategory) {
                const allSiblingsDeselected = parentCategory.subcategories.every((sibling) => !updatedFilters.category.includes(sibling.id));
                if (allSiblingsDeselected) {
                    const addSubcategoryIds = (subcategories) => {
                        subcategories.forEach((subcategory) => {
                            updatedFilters.category.push(subcategory.id);
                            if (subcategory.subcategories.length > 0) {
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
            const category = findCategoryById(categories, categoryId);
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

    // Helper function to render category filters recursively
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
                {expandedFilters.includes("Category") ? renderCategoryFilters(categories, 1) : null}
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
};
