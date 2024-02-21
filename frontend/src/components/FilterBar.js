import { useEffect, useState } from "react";

export const FilterBar = ({ categories, fields, filters, setFilters }) => {
    

    const [expandedFilters, setExpandedFilters] = useState([]);

    const handleExpandFilter = (filterName) => {
        if (expandedFilters.includes(filterName)) {
            setExpandedFilters(expandedFilters.filter((filter) => filter !== filterName));
        } else {
            setExpandedFilters([...expandedFilters, filterName]);
        }
    };

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

    const selectCategory = (categoryId) => {
        const updatedFilters = { ...filters };
        const category = findCategoryById(categories, categoryId);
        if (category) {
            if (category.subcategories.length === 0) {
                updatedFilters.category = [...updatedFilters.category, categoryId];
            } else {
                updatedFilters.category = [...updatedFilters.category, categoryId];
                category.subcategories.forEach((subcategory) => {
                    selectCategory(subcategory.id);
                });
            }
        }
        setFilters(updatedFilters);
    };

    const deselectCategory = (categoryId) => {
        const updatedFilters = { ...filters };
        const category = findCategoryById(categories, categoryId);
        if (category) {
            const removeCategoryAndChildren = (category) => {
                updatedFilters.category = updatedFilters.category.filter((catId) => catId !== category.id);
                category.subcategories.forEach((subcategory) => removeCategoryAndChildren(subcategory));
            };
            removeCategoryAndChildren(category);
        }
        setFilters(updatedFilters);
    };

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
                                checked={filters.category.includes(category.id)}
                                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                            />
                            <label className="ml-2 text-gray-700">{category.name}</label>
                        </div>
                        {filters.category.includes(category.id) && category.subcategories.length > 0 && renderCategoryFilters(category.subcategories, level + 1)}
                    </div>
                ))}
            </div>
        );
    };

    const renderFieldFilters = () => {
        return fields.map((field) => (
            <div key={field.id}>
                <hr class="my-2 border-t border-gray-300 w-3/4" />
                <div class="flex flex-row justify-between w-3/4">
                    <h5 class="text-lg font-bold">{field.name}</h5>
                    <button class="text-lg" onClick={() => handleExpandFilter(field.name)}>
                        {expandedFilters.includes(field.name) ? "-" : "+"}
                    </button>
                </div>
            </div>
        ));
    };

    useEffect(() => {
        console.log(filters)
    },[filters])

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
        </div>
    );
};
