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

  const deleteCategory = async (categoryId) => {
    try {
      console.log("Deleting category:", categoryId);
      let deleteString = `http://127.0.0.1:5000/api/delete-category/?id=${categoryId}`;
      deleteString += "&delete-members=true";

      const response = await fetch(deleteString, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      } else {
        alert("Category deleted successfully!");
        
      }
    } catch (error) {
      console.error("Error deleting categories", error);
      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to delete category: ${error.response.data.message}`);
      } else {
        alert("Failed to delete category");
      }
    }
  };

  const handleSubmit = async (event) => {
    const categoryName = event.target.name.value;
    if (categoryName === "") {
      alert("Category name is required");
      return;
    }

    if (categories.some((category) => category.name === categoryName)) {
      const confirmDelete = window.confirm(`Category "${categoryName}" already exists. Would you like to delete it?`);
      if (confirmDelete) {
        try {
          const categoryId = categories.find((category) => category.name === categoryName).id;
          deleteCategory(categoryId);
        } catch (error) {
          console.error("Error deleting category:", error);
          alert("Failed to delete category");
        }
      }
      return;
    }

    event.preventDefault();

    try {
      const formData = new FormData(event.target);
      const response = await apiService.createCategory(formData);
      alert("Category created successfully!");
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Error creating category:", error);
      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to create category: ${error.response.data.message}`);
      } else {
        alert("Failed to create category");
      }
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
              <ActionButton type="submit" size="lg">
                Confirm
              </ActionButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
