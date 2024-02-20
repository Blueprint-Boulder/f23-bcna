export const FilterBar = ({categories,expandedCategories, setExpandedCategories, selectedCategories,setSelectedCategories}) => {

    const toggleCategory = (categoryId) => {
        if (expandedCategories.includes(categoryId)) {
          setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
        } else {
          setExpandedCategories([...expandedCategories, categoryId]);
        }
    }

    const toggleSubcategory = (category) => {
        if(selectedCategories.includes(category.id)){
            setSelectedCategories(selectedCategories.filter(id => id !== category.id))
        }else{
            setSelectedCategories([...selectedCategories],category.id)
        }
    }

    const renderSubcategories = (subcategories) => {

        return (
            <div className="flex flex-col">
                {subcategories.map((subcategory) => {

                    

                    return(
                        <div>
                        <input
                        
                        type="checkbox"
                        
                        />
                        <label class="text-lg">{subcategory.name}</label>

                            <div class="ml-4">
                                {renderSubcategories(subcategory.subcategories)}
                            </div>


                        </div>
                    )
                })}
            </div>
        )
    }

    return (
                <div class="flex flex-col items-left">
                    <div class="my-2">
                        <label for="titleFilter" class="text-lg font-bold">Filter by</label>
                    </div>

                    {categories.map((category) => {

                        const isCategoryExpanded = expandedCategories.includes(category.id)

                        return (
                            <>
                            <div key={category.id}>
                                <hr class="my-2 border-t border-gray-300 w-3/4"/>
                                <div class="flex flex-row justify-between w-3/4">
                                    <label for="categoryFilter" class="text-lg font-bold">{category.name}</label>
                                    <button class="text-lg" onClick={() => toggleCategory(category.id)}>
                                        {isCategoryExpanded ? '-' : '+'}
                                    </button>
                                </div>
                            </div>


                            {isCategoryExpanded && renderSubcategories(category.subcategories)}
                            

                            </>
                        )
                        })}

                    {/* Final Horizontal Line */}
                    <hr class="my-2 border-t border-gray-300 w-3/4"/>


                </div>
    )
}