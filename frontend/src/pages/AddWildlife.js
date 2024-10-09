import { useState, useEffect } from "react";
import { ActionButton } from "../components/ActionButton";
import apiService from "../services/apiService";

export default function AddWildlife() {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fields, setFields] = useState({});
  const [displayedFields, setDisplayedFields] = useState([]);

  const fetchData = async () => {
    // gets all categories and fields from the database with an API route
    try {
      const data = await apiService.getCategoriesAndFields();
      setCategories(data.categories);
      setFields(data.fields);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    // fetch data on page load
    fetchData();
  }, []);

  useEffect(() => {
    // find fields and determine deletion options
    const findFields = () => {
      const tempFields = [];
      selectedCategory.field_ids.forEach((currId) =>
        tempFields.push(fields[currId])
      );
      setDisplayedFields(tempFields);
    };
    if (selectedCategory) {
      findFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(categories[e.target.value]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.target);
      const response = await apiService.createWildlife(formData);
      alert("Wildlife created successfully!");
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Error creating wildlife:", error);
      alert("Failed to create wildlife");
    }
  };

  return (
    <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] bg-cover w-screen h-[120vh]">
      <div className="h-8"></div>
      <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg">
        <h1 className="text-3xl font-bold mb-8 pt-4 text-center">
          Add Wildlife
        </h1>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="w-11/12 flex flex-col items-center lg:items-start mx-auto"
        >
          <div className="w-full lg:w-3/5">
            <label htmlFor="categoryName">
              Category<span className="text-red-500">*</span>
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
                --Select if applicable--
              </option>
              {Object.values(categories).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label htmlFor="wildlifeName">
              Wildlife Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              id="wildlifeName"
              name="name"
            />
            <label htmlFor="scientific">
              Scientific Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              id="scientific"
              name="scientific_name"
            />

            {selectedCategory &&
              displayedFields.length > 0 &&
              displayedFields.map((item) => (
                <>
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
                </>
              ))}
          </div>
          <div className="self-center flex gap-8 my-4 items-center">
            <ActionButton color="red" size="lg">
              Cancel
            </ActionButton>
            <ActionButton size="lg">Confirm</ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
