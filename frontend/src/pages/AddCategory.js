import { ActionButton } from "../components/ActionButton";
import { useState, useEffect } from "react";
import apiService from "../services/apiService";

export default function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.target);
      const response = await apiService.createCategory(formData);
      alert("Category created successfully!");
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    }
  };

  return (
    <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] w-screen h-[120vh]">
      <div className="h-8"></div>
      <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg">
        <h1 className="text-3xl font-bold mb-8 pt-4 text-center">
          Add Category
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-11/12 flex flex-col items-center lg:items-start mx-auto"
        >
          <div className="w-full lg:w-3/5 mb-6">
            <label htmlFor="name">
              Category Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              name="name"
              required
            />
            <label htmlFor="parent">Parent Category</label>
            <select
              className="mt-1 mb-8 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              id="parent"
              name="parent_id"
              defaultValue="default"
            >
              <option value="default" disabled>
                --Select if applicable--
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="self-center flex gap-8 my-4 items-center">
              <ActionButton
                onClick={() => (window.location.href = "/admin")}
                color="red"
                size="lg"
              >
                Cancel
              </ActionButton>
              <ActionButton size="lg">Confirm</ActionButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
