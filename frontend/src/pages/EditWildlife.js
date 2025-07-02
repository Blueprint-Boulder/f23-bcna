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
  const [selectedWildlifeInfo, setSelectedWildlifeInfo] = useState(null);
  // Removed unused images state

  // FOR LOADING PAGE, CATEGORIES, AND WILDLIFE
  //_______________________________________________//

  // Fetch all data needed for the form on page load
  useEffect(() => {
    // fetch data on page load
    fetchCategories();
    fetchWildlife();
  }, []);

  // Fetch categories and fields from the API
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


  // FOR HANDLING CATEGORY AND WILDLIFE SELECTION
  //_______________________________________________//

  const handleCategoryChange = (e) => {
    setSelectedCategory(categories[e.target.value]);
  };

  const handleWildlifeChange = (e) => {
    const selected = displayedWildlife.find((entry) => entry.id == e.target.value);
    setSelectedWildlife(selected);
    console.log("Selected Wildlife ID: ", selected ? selected.id : null);
  };

  // Loading Fields based on selected category

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

  // Fetch wildlife details by ID when the wildlifeId changes
  
  useEffect(() => {
    const fetchWildlifeById = async () => {
      if (selectedWildlife) {
        try {
          // Fetch wildlife data by ID
          const data = await apiService.getWildlifeById(selectedWildlife.id);
          setSelectedWildlifeInfo(data);
        } catch (error) {
          console.error("Error fetching wildlife details:", error);
        }
      }
    };
    console.log("fetching wildlife info");
    fetchWildlifeById();
    console.log("Selected Wildlife: ", selectedWildlifeInfo);

  }, [selectedWildlife]);


  // FOR HANDLING FORM SUBMISSION AND DELETION
  //_______________________________________________//

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting form with data:", event.target);
    try {
      const formData = new FormData(event.target);

      // Remove empty files from FormData
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size === 0) {
          formData.delete(key);
        }
      }

      await apiService.editWildlife(formData);
      alert("Wildlife edited successfully!");
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Error editing wildlife:", error);
      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to edit wildlife: ${error.response.data.message}`);
      } else {
        alert("Failed to edit wildlife");
      }
    }
  };

  const deleteWildlife = async () => {
    try {
      let deleteString = `http://127.0.0.1:5000/api/delete-wildlife/?id=${selectedWildlife.id}`;

      const response = await fetch(deleteString, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete wildlife");
      } else {
        alert("Wildlife deleted successfully!");
        window.location.href = window.location.pathname;
      }
    } catch (error) {
      console.error("Error deleting wildlife", error);
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
              defaultValue={selectedCategory ? selectedCategory.id : "default"}
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
                  defaultValue={selectedWildlife ? selectedWildlife.id : "default"}
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
                {selectedWildlifeInfo &&
                  displayedFields.length > 0 &&
                  displayedFields.map((item) => (
                    <div key={item.id}>
                      <label htmlFor={item.id}>
                        {item.name} ({item.type})
                      </label>
                      <div className="mb-4">
                      {item.type === "IMAGE" &&
                          <img
                            src={`http://127.0.0.1:5000/api/get-image/${selectedWildlifeInfo[item.name]}`}
                            alt={item.name}
                            className="w-32 h-32 object-cover mb-2"
                          />}
                      <input
                        type={item.type === "IMAGE" ? "file" : "text"}
                        name={item.name}
                        min="0"
                        id={item.id}
                        className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        {...(item.type !== "IMAGE" && {
                          defaultValue: selectedWildlifeInfo[item.name] || "",
                        })}
                        onChange={(e) => {
                          if (item.type !== "IMAGE") {
                            setSelectedWildlifeInfo((prev) => ({
                              ...prev,
                              [item.name]: e.target.value,
                            }));
                          }
                        }}
                      />
                        </div>
                    </div>
                  ))}
                {displayedWildlife && (
                  <ActionButton color="red" size="lg" onClick={deleteWildlife}>
                    Delete Wildlife
                  </ActionButton>
                )}
              </>
            )}
          </div>
          <div className="self-center flex gap-8 my-4 items-center">
            <ActionButton
              color="red"
              size="lg"
              onClick={() => (window.location.href = "/admin")}
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
