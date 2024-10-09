import { useState, useEffect } from "react";
import { ActionButton } from "../components/ActionButton";
import apiService from "../services/apiService";

export default function EditWildlife() {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fields, setFields] = useState({});
  const [displayedFields, setDisplayedFields] = useState([]);
  const [wildlife, setWildlife] = useState([]);
  const [displayedWildlife, setDisplayedWildlife] = useState([]);
  const [selectedWildlife, setSelectedWildlife] = useState(null);

  const fetchCategories = async () => {
    // gets all categories and fields from the database with an API route
    try {
      const data = await apiService.getCategoriesAndFields();
      setCategories(data.categories);
      setFields(data.fields);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWildlife = async () => {
    // gets all categories and fields from the database with an API route
    try {
      const data = await apiService.getAllWildlife();
      setWildlife(data);
    } catch (error) {
      console.error("Error fetching wildlife:", error);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(categories[e.target.value]);
  };

  const handleWildlifeChange = (e) => {
    setSelectedWildlife(
      displayedWildlife.find((entry) => entry.id == e.target.value)
    );
  };

  useEffect(() => {
    const findFields = () => {
      const tempFields = [];
      selectedCategory.field_ids.forEach((currId) =>
        tempFields.push(fields[currId])
      );
      setDisplayedFields(tempFields);
    };
    if (selectedCategory) {
      findFields();
      setDisplayedWildlife(
        wildlife.filter((entry) => entry.category_id === selectedCategory.id)
      );
    }
  }, [selectedCategory]);

  useEffect(() => {
    // fetch data on page load
    fetchCategories();
    fetchWildlife();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.target);
      const response = await apiService.editWildlife(formData);
      alert("Wildlife edited successfully!");
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to edit wildlife");
    }
  };

  return (
    <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] bg-cover w-screen h-[120vh]">
      <div className="h-8"></div>
      <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg overflow-auto">
        <h1 className="text-3xl font-bold mb-8 pt-4 text-center">
          Edit Wildlife
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-11/12 flex flex-col items-center lg:items-start mx-auto"
        >
          <div className="w-full lg:w-3/5">
            <label htmlFor="categoryName">
              Category Name<span className="text-red-500">*</span>
            </label>
            <select
              className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              id="categoryName"
              onChange={handleCategoryChange}
              defaultValue="default"
              name="category_id"
              required
            >
              <option value="default" disabled>
                --Select this wildlife's category--
              </option>
              {Object.values(categories).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {selectedCategory && (
              <>
                <label htmlFor="wildlifeName">
                  Wildlife Name<span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                                focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  id="wildlifeName"
                  onChange={handleWildlifeChange}
                  defaultValue="default"
                  name="wildlife_id"
                  required
                >
                  <option value="default" disabled>
                    --Select wildlife--
                  </option>
                  {displayedWildlife.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
                {selectedWildlife &&
                  displayedFields.length > 0 &&
                  displayedFields.map((item) => (
                    <div key={item.id}>
                      <label htmlFor={item.id}>
                        {item.name} ({item.type})
                      </label>
                      <input
                        type={item.type === "IMAGE" ? "file" : "text"}
                        name={item.name}
                        min="0"
                        id={item.id}
                        className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                  ))}
              </>
            )}
          </div>
          <div className="self-center flex gap-8 my-4 items-center">
            <ActionButton
              color="red"
              size="lg"
              onClick={() => (window.location.href = window.location.pathname)}
            >
              Cancel
            </ActionButton>
            <ActionButton size="lg" type="submit">
              Confirm
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
