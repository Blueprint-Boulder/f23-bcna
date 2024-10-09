import React, { useEffect, useState } from "react";

export const FilterBar = ({
  wildlife,
  categories,
  fields,
  filters,
  setFilters,
}) => {
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

  // Helper function to capitalize the first letter of a word
  function capitalizeFirstLetter(word) {
    if (typeof word !== "string" || word.length === 0) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // Handler for expanding/collapsing filter rows
  const handleExpandFilter = (filterName) => {
    if (expandedFilters.includes(filterName)) {
      setExpandedFilters(
        expandedFilters.filter((filter) => filter !== filterName)
      );
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

  // Expecting ID, get corresponding category, handle subcategories

  const selectCategory = (categoryId) => {
    // Make a copy of filters and selected categories
    const updatedFilters = { ...filters };
    const updatedSelectedCategories = [...selectedCategories];

    // Find the category selected in categories array
    const category = findCategoryById(categoryId);
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

      // Add all subcategories (children) to updatedFilters.category recursively
      const addSubcategories = (subcategories) => {
        subcategories.forEach((subcategory) => {
          if (!updatedFilters.category.includes(subcategory)) {
            updatedFilters.category.push(subcategory);
          }
          // Add the subcategory ID to filters
          const subcategoryObject = findCategoryById(subcategory);
          if (subcategoryObject.subcategories.length > 0) {
            addSubcategories(subcategoryObject.subcategories); // Recursively add subcategories
          }
        });
      };
      addSubcategories(category.subcategories);

      // Get parent category
      const parentCategory = findCategoryById(category.parent_id);

      // If parent category found, update the siblings of category selected accordingly
      if (parentCategory) {
        parentCategory.subcategories.forEach((sibling) => {
          // If sibling is selected , leave it alone

          // If sibling isn't selected, recursively remove sibling and its subcategories from filtres
          if (!updatedSelectedCategories.includes(sibling)) {
            // Get rid of sibling from filters
            updatedFilters.category = updatedFilters.category.filter(
              (catId) => catId !== sibling
            );

            const siblingObject = findCategoryById(sibling);

            // Remove every subcategory of category from filters recursively
            const removeSubcategoriesFromFilters = (subcategories) => {
              subcategories.forEach((subcategory) => {
                updatedFilters.category = updatedFilters.category.filter(
                  (catId) => catId !== subcategory
                );
                const subcategoryObject = findCategoryById(subcategory);

                if (subcategoryObject.subcategories.length > 0) {
                  removeSubcategoriesFromFilters(
                    subcategoryObject.subcategories
                  );
                }
              });
            };
            removeSubcategoriesFromFilters(siblingObject.subcategories);
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
      updatedFilters.category = updatedFilters.category.filter(
        (catId) => catId !== categoryId
      );
      // Get rid of category from selected categories
      let updatedSelectedCategories = [...selectedCategories].filter(
        (catId) => catId !== categoryId
      );

      // Remove every subcategory of category from filters recursively
      const deselectSubcategories = (subcategories) => {
        subcategories.forEach((subcategory) => {
          updatedFilters.category = updatedFilters.category.filter(
            (catId) => catId !== subcategory
          );
          updatedSelectedCategories = updatedSelectedCategories.filter(
            (catId) => catId !== subcategory
          );

          const subcategoryObject = findCategoryById(subcategory);

          if (subcategoryObject.subcategories.length > 0) {
            deselectSubcategories(subcategoryObject.subcategories);
          }
        });
      };

      deselectSubcategories(category.subcategories);

      // Get parent of category
      const parentCategory = findCategoryById(category.parent_id);

      // If parent exists and all siblings are deselected, add all siblings to filters (just not selected filters)
      if (parentCategory) {
        const allSiblingsDeselected = parentCategory.subcategories.every(
          (sibling) => !updatedFilters.category.includes(sibling)
        );
        if (allSiblingsDeselected) {
          // Add all subcategory children of the parent to filters
          const addSubcategoryIds = (subcategories) => {
            subcategories.forEach((subcategory) => {
              updatedFilters.category.push(subcategory);
              const subcategoryObject = findCategoryById(subcategory);

              if (subcategoryObject.subcategories.length > 0) {
                addSubcategoryIds(subcategoryObject.subcategories);
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

  const updateSharedFields = () => {
    const fieldCount = {};
    const leafCategories = selectedCategories.filter((categoryId) => {
      const category = findCategoryById(categoryId);
      return (
        category &&
        category.subcategories.every(
          (subcategoryId) => !selectedCategories.includes(subcategoryId)
        )
      );
    });

    leafCategories.forEach((categoryId) => {
      const category = findCategoryById(categoryId);
      if (category) {
        category.field_ids.forEach((fieldId) => {
          fieldCount[fieldId] = (fieldCount[fieldId] || 0) + 1;
        });
      }
    });

    const newSharedFields = fields.filter(
      (field) => fieldCount[field.id] === leafCategories.length
    );
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
        {categories.map((categoryId) => {
          const category = findCategoryById(categoryId);

          return (
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
              {selectedCategories.includes(category.id) &&
                category.subcategories.length > 0 &&
                renderCategoryFilters(category.subcategories, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // Handler for changing INTEGER field values
  const handleIntegerFieldChange = (fieldId, rangeType, value) => {
    const updatedFilters = { ...filters };

    if (!updatedFilters.fields) {
      updatedFilters.fields = {};
    }

    if (!updatedFilters.fields[fieldId]) {
      updatedFilters.fields[fieldId] = {};
    }

    updatedFilters.fields[fieldId]["id"] = fieldId;
    updatedFilters.fields[fieldId]["filterValues"] = [value];

    setFilters(updatedFilters);
  };

  // Handler for changing TEXT field values
  const handleTextFieldChange = (fieldId, option, isChecked) => {
    const updatedFilters = { ...filters };

    if (!updatedFilters.fields) {
      updatedFilters.fields = {};
    }

    if (!updatedFilters.fields[fieldId]) {
      updatedFilters.fields[fieldId] = {};
    }

    if (!updatedFilters.fields[fieldId]["filterValues"]) {
      updatedFilters.fields[fieldId]["filterValues"] = [];
    }

    if (isChecked) {
      updatedFilters.fields[fieldId]["filterValues"].push(option);
    } else {
      updatedFilters.fields[fieldId]["filterValues"] = updatedFilters.fields[
        fieldId
      ]["filterValues"].filter((item) => item !== option);
    }

    setFilters(updatedFilters);
  };

  const renderFieldFilters = () => {
    return sharedFields.map(
      (field) =>
        // Check if the field type is not "IMAGE"
        field.type !== "IMAGE" && (
          <div key={field.id}>
            <div className="flex flex-row justify-between w-3/4">
              <h5 className="text-lg font-bold">
                {capitalizeFirstLetter(field.name)}
              </h5>
              <button
                className="text-lg"
                onClick={() => handleExpandFilter(field.name)}
              >
                {expandedFilters.includes(field.name) ? "-" : "+"}
              </button>
            </div>
            {expandedFilters.includes(field.name) && (
              <div className="flex flex-col w-3/4">
                {field.type === "INTEGER" ? (
                  // Render INTEGER fields as input ranges
                  <div className="flex items-center p-3">
                    <input
                      type="number"
                      placeholder="Min"
                      onChange={(e) =>
                        handleIntegerFieldChange(
                          field.id,
                          "min",
                          e.target.value
                        )
                      }
                      value={
                        (filters.fields &&
                          filters.fields[field.id]?.["filterValues"]?.[0]) ||
                        ""
                      }
                      className="form-input w-1/2 mr-2"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      onChange={(e) =>
                        handleIntegerFieldChange(
                          field.id,
                          "max",
                          e.target.value
                        )
                      }
                      value={
                        (filters.fields &&
                          filters.fields[field.id]?.["filterValues"]?.[1]) ||
                        ""
                      }
                      className="form-input w-1/2"
                    />
                  </div>
                ) : field.type === "TEXT" ? (
                  // Render TEXT fields with options collected from field values
                  <div className="flex flex-col">
                    {getFieldOptions(field.id).map((option) => (
                      <label className="flex items-center" key={option}>
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          onChange={(e) =>
                            handleTextFieldChange(
                              field.id,
                              option,
                              e.target.checked
                            )
                          }
                          checked={
                            (filters.fields &&
                              filters.fields[field.id] &&
                              filters.fields[field.id]["filterValues"] &&
                              filters.fields[field.id]["filterValues"].includes(
                                option
                              )) ||
                            false
                          }
                        />
                        <span className="ml-2">
                          {capitalizeFirstLetter(option)}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
            <hr className="my-2 border-t border-gray-300 w-3/4" />
          </div>
        )
    );
  };

  // Helper function to collect options for TEXT fields from field values
  const getFieldOptions = (fieldId) => {
    const values = wildlife
      .filter((item) =>
        item.field_values.some((value) => value.field_id === fieldId)
      )
      .map(
        (item) =>
          item.field_values.find((value) => value.field_id === fieldId).value
      );
    return Array.from(new Set(values));
  };

  const getParentCategoryArray = () => {
    return categories
      .filter((category) => category.parent_id === null)
      .map((category) => category.id);
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
          <button
            className="text-lg"
            onClick={() => handleExpandFilter("Category")}
          >
            {expandedFilters.includes("Category") ? "-" : "+"}
          </button>
        </div>
        {expandedFilters.includes("Category")
          ? renderCategoryFilters(getParentCategoryArray(), 1)
          : null}
        <hr className="my-2 border-t border-gray-300 w-3/4" />
      </div>

      <div>{renderFieldFilters()}</div>

      <br />
      <button
        className="text-left underline text-gray-600"
        onClick={handleResetFilters}
      >
        Reset all filters
      </button>
    </div>
  );
};
