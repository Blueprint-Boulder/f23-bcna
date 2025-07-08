import { useState, useEffect, useRef } from "react";
import { ActionButton } from "../components/ActionButton";
import apiService from "../services/apiService";

export default function AddWildlife() {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fields, setFields] = useState({});
  const [displayedFields, setDisplayedFields] = useState([]);
  const [images, setImages] = useState([]);
  const thumbnailImageRef = useRef(null);
  const supplementalImageRefs = useRef([]);

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
    event.preventDefault();;

    try {
      const formData = new FormData(event.target);
      for (const [key, value] of formData.entries()) {
        if (!value || (typeof value === 'string' && value.trim() === '') || (value instanceof File && value.size === 0)) {
          alert(`Please fill in all fields with information`);
          return;
        }
      }
      // const imagesFormData = new FormData();
      // if (thumbnailImageRef.current && thumbnailImageRef.current.files && thumbnailImageRef.current.files[0]) {
      //   imagesFormData.append("thumbnail", thumbnailImageRef.current.files[0]);
      // }
      // imageRefs.current.forEach((ref, index) => {
      //   if (ref && ref.files && ref.files[0]) {
      //     imagesFormData.append(`image_${index}`, ref.files[0]);
      //   }
      // });

      // create wildlife
      const response = await apiService.createWildlife(formData);

      console.log(response.wildlife_id)
      if (response.wildlife_id) {
        const wildlifeId = response.wildlife_id;

        // Upload thumbnail image if present
        if (
          thumbnailImageRef.current &&
          thumbnailImageRef.current.files &&
          thumbnailImageRef.current.files[0]
        ) {
          const thumbnailFormData = new FormData();
          thumbnailFormData.append("image_file", thumbnailImageRef.current.files[0]);
          thumbnailFormData.append("wildlife_id", wildlifeId);
          thumbnailFormData.append("is_thumbnail", true);
          try {
            await apiService.addImage(thumbnailFormData);
          } catch (err) {
            console.error("Error uploading thumbnail:", err);
            alert("Wildlife created, but failed to upload thumbnail image.");
          }
        }

        // Upload supplemental images if present
        if (supplementalImageRefs.current && supplementalImageRefs.current.length > 0) {
          for (const ref of supplementalImageRefs.current) {
            if (ref && ref.files && ref.files[0]) {
              const imageFormData = new FormData();
              imageFormData.append("image_file", ref.files[0]);
              imageFormData.append("wildlife_id", wildlifeId);
              imageFormData.append("is_thumbnail", false);
              try {
                await apiService.addImage(imageFormData);
              } catch (err) {
                console.error("Error uploading supplemental image:", err);
                alert("Wildlife created, but failed to upload one or more supplemental images.");
              }
            }
          }
        }

        alert("Wildlife created successfully and images added!");
      } else {
        alert("Wildlife created successfully, but cannot add images. Try again in Edit Wildlife.");
      }
      // window.location.href = window.location.pathname;
    } catch (error) {
      console.error("Error creating wildlife:", error);
      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to create wildlife: ${error.response.data.message}`);
      } 
      else {
        alert("Failed to create wildlife");
      }
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
              {selectedCategory && (
                <>
                  <div className="mb-4 border-2 border-gray-300 rounded-md p-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Thumbnail Image
                    </label>
                    <input
                      type="file"
                      ref={el => (thumbnailImageRef.current = el)}
                      className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm flex items-center justify-center h-10 hover:border-blue-400"
                      style={{ background: "#f9fafb" }}
                      accept="image/*"
                      title="Add Thumbnail"
                    />
                  </div>
                  <div className="mb-4 border-2 border-gray-300 rounded-md p-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Supplemental Images
                    </label>
                    {images.map((_, idx) => (
                      <input
                        key={idx}
                        type="file"
                        ref={el => supplementalImageRefs.current[idx] = el}
                        className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm flex items-center justify-center h-10 hover:border-blue-400"
                        style={{ background: "#f9fafb" }}
                        accept="image/*"
                        title="Add Image"
                      />
                    ))}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setImages([...images, ""])}
                      >
                        Add Image
                      </button>
                      <button
                        type="button"
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setImages(images.slice(0, -1))}
                        disabled={images.length === 0}
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                </>
              )}

          </div>
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
        </form>
      </div>
    </div>
  );
}
