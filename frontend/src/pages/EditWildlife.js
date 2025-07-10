import { useState, useEffect, useRef } from "react";
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
  const [images, setImages] = useState([]);
  const [thumbnail, setThumbnail] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(null);

  const imageRefs = useRef([]);

  // Fetch all data needed for the form on page load
  useEffect(() => {
    fetchCategories();
    fetchWildlife();
  }, []);

  // Fetch categories and fields from the API
  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategoriesAndFields();
      setCategories(data.categories);
      setFields(data.fields);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWildlife = async () => {
    try {
      const data = await apiService.getAllWildlife();
      setWildlife(data);
    } catch (error) {
      console.error("Error fetching wildlife:", error);
    }
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    setSelectedCategory(categories[e.target.value]);
    setSelectedWildlife(null);
    setSelectedWildlifeInfo(null);
    setImages([]);
    imageRefs.current = [];
  };

  // Handle wildlife selection
  const handleWildlifeChange = async (e) => {
    const selected = displayedWildlife.find((entry) => entry.id == e.target.value);
    setSelectedWildlife(selected);
    setImages([]);
    imageRefs.current = [];
    // selectedWildlifeInfo will be set in useEffect below
  };

  // Loading Fields based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const tempFields = [];
      selectedCategory.field_ids.forEach((currId) =>
        tempFields.push(fields[currId])
      );
      setDisplayedFields(tempFields);
      setDisplayedWildlife(
        wildlife.filter((entry) => entry.category_id === selectedCategory.id)
      );
    } else {
      setDisplayedFields([]);
      setDisplayedWildlife([]);
    }
  }, [selectedCategory, fields, wildlife]);

  // Fetch wildlife details and images by ID when the wildlifeId changes
  useEffect(() => {
    const fetchWildlifeById = async () => {
      if (selectedWildlife) {
        try {
          const data = await apiService.getWildlifeById(selectedWildlife.id);
          setSelectedWildlifeInfo(data);
        } catch (error) {
          console.error("Error fetching wildlife details:", error);
        }
      } else {
        setSelectedWildlifeInfo(null);
      }
    };
    const fetchImages = async () => {
      if (selectedWildlife) {
        try {
          const imgs = await apiService.getImagesByWildlifeId(selectedWildlife.id);
          console.log("imgs", imgs);
          setImages(imgs);
          console.log(imgs);
          console.log("thumbnail", selectedWildlife.thumbnail_id);
          const thumbnailImg = imgs.find(img => img.id === selectedWildlife.thumbnail_id);
          setThumbnail(thumbnailImg);
          setThumbnailIndex(imgs.findIndex(img => img.id === selectedWildlife.thumbnail_id));
          imageRefs.current = new Array(imgs.length).fill(null);
        } catch (error) {
          setImages([]);
          imageRefs.current = [];
        }
      } else {
        setImages([]);
        imageRefs.current = [];
      }
    };
    fetchWildlifeById();
    fetchImages();
  }, [selectedWildlife]);
    const addImages = async () => {
      for (let idx = 0; idx < imageRefs.current.length; idx++) {
        const ref = imageRefs.current[idx];
        if (ref && ref.files && ref.files[0]) {
          const formData = new FormData();
          formData.append("image_file", ref.files[0]);
          formData.append("wildlife_id", selectedWildlife.id);
          if (idx === thumbnailIndex && response?.id) formData.append("is_thumbnail", true);
          else formData.append("is_thumbnail", false);
          const response = await apiService.addImage(formData);
    
          // If this was the thumbnail index, update wildlife info with new thumbnail ID
        }
      }
    };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);

      await apiService.editWildlife(formData);
      if(images.length > 0) {
        addImages();
      }

      alert("Wildlife edited successfully!");
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Error editing wildlife:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to edit wildlife: ${error.response.data.message}`);
      } else {
        alert("Failed to edit wildlife");
      }
    }
  };

  handleRemoveImage= async (image)  => {

     }

  // Handle wildlife deletion
  const deleteWildlife = async () => {
    if (!selectedWildlife) return;
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

  // Handler for removing an image (to be implemented)
  const handleRemoveImage = (idx) => {
    // Placeholder for your logic
    // You can implement the actual removal logic here
    // For now, just log the index
    console.log("Remove image at index:", idx);
  };

  return (
    <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] bg-cover w-screen min-h-screen">
      <div className="h-8"></div>
      <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg overflow-auto">
        <h1 className="text-3xl font-bold mb-8 pt-4 text-center">
          Edit Wildlife
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-11/12 flex flex-col items-center lg:items-start mx-auto"
          encType="multipart/form-data"
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
              value={selectedCategory ? selectedCategory.id : "default"}
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
                  value={selectedWildlife ? selectedWildlife.id : "default"}
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
                        {item.type === "IMAGE" && selectedWildlifeInfo[item.name] && (
                          <img
                            src={`http://127.0.0.1:5000/api/get-image/${selectedWildlifeInfo[item.name]}`}
                            alt={item.name}
                            className="w-32 h-32 object-cover mb-2"
                          />
                        )}
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
                {selectedWildlife && (
                  <>
                    <div className="mb-2 font-semibold">Supplemental Images:</div>
                    {images && images.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {images.map((image, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            {image ? (
                              <>
                                <img
                                  src={`http://127.0.0.1:5000/api/get-image/${image.image_path}`}
                                  alt={`Supplemental ${idx + 1}`}
                                  className="w-24 h-24 object-cover mb-1 rounded"
                                />
                                <label className="text-sm flex items-center gap-1 mb-1">
                                  <input
                                    type="checkbox"
                                    checked={thumbnailIndex === idx}
                                    onChange={() => {
                                      setThumbnail(image.id);
                                      setThumbnailIndex(idx);
                                      setSelectedWildlifeInfo((prev) => ({
                                        ...prev,
                                        thumbnail_id: image.id,
                                      }));
                                    }}
                                  />
                                  Thumbnail
                                </label>
                                <button
                                  type="button"
                                  className="bg-red-500 text-white rounded px-2 py-1 mb-1"
                                  onClick={() => handleRemoveImage(idx)}
                                >
                                  Remove Image
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500 mb-1 rounded">
                                  New Image
                                </div>
                                <label className="text-sm flex items-center gap-1 mb-1">
                                  <input
                                    type="checkbox"
                                    checked={thumbnailIndex === idx}
                                    onChange={() => {
                                      setThumbnail(null);
                                      setThumbnailIndex(idx);
                                      setSelectedWildlifeInfo((prev) => ({
                                        ...prev,
                                        thumbnail_id: null, // No ID yet
                                      }));
                                    }}
                                  />
                                  Thumbnail
                                </label>
                                <button
                                  type="button"
                                  className="bg-red-500 text-white rounded px-2 py-1 mb-1"
                                  onClick={() => handleRemoveImage(image)}
                                >
                                  Remove Image
                                </button>
                              </>
                            )}
                            <label className="block mt-1 mb-2 w-full">
                              <span className="sr-only">Choose new file</span>
                              <input
                                type="file"
                                placeholder="choose new file"
                                ref={(el) => (imageRefs.current[idx] = el)}
                                className="w-full rounded-md border-gray-300 shadow-sm
                                  focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="bg-blue-500 rounded-md text-white px-4 py-2 mb-4"
                      onClick={() => {
                        setImages([...images, null]);
                        imageRefs.current = [...imageRefs.current, null];
                      }}
                    >
                      Add Image
                    </button>

                    <div className="mb-4"></div>
                    <ActionButton color="red" size="lg" onClick={deleteWildlife}>
                      Delete Wildlife
                    </ActionButton>
                  </>
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
