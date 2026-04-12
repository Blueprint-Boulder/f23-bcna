import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import apiService from "../services/apiService";
import { AdminContext } from "../services/adminContext";
import { X, Camera } from "lucide-react"

function ImageEditModal({ image, baseUrl, onClose, onSave, onDelete, currentThumbnailId }) {
  const [preview, setPreview] = useState(image?.image_path ? `${baseUrl}${image.image_path}` : null);
  const [file, setFile] = useState(null);
  const [dateTaken, setDateTaken] = useState(image?.date_taken || "");
  const [locationTaken, setLocationTaken] = useState(image?.location_taken || "");
  const [isThumbnail, setIsThumbnail] = useState(
    image?.id != null ? image.id == currentThumbnailId : false
  );


  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-pink-50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold text-pink-900 mb-4 text-center">Edit Image Details</h2>

        <label className="block cursor-pointer mb-4">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {preview ? (
            <div className="relative group rounded-xl overflow-hidden">
              <img src={preview} className="w-full h-48 object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <Camera className="text-white w-10 h-10" />
              </div>
            </div>
          ) : (
            <div className="w-full h-48 border-4 border-dashed border-pink-400 rounded-xl bg-pink-100 flex items-center justify-center">
              <span className="text-pink-500 text-5xl font-light">+</span>
            </div>
          )}
        </label>

        <div className="mb-3">
          <label className="block text-pink-900 font-bold mb-1">Date taken</label>
          <input
            type="text"
            placeholder="MM/DD/YYYY"
            value={dateTaken}
            onChange={(e) => setDateTaken(e.target.value)}
            className="w-full border border-pink-200 rounded-lg px-3 py-2 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-pink-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-pink-900 font-bold mb-1">Location taken</label>
          <input
            type="text"
            placeholder="City, State"
            value={locationTaken}
            onChange={(e) => setLocationTaken(e.target.value)}
            className="w-full border border-pink-200 rounded-lg px-3 py-2 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Thumbnail Checkbox */}
        <label
          className="flex items-center gap-3 mb-5 cursor-pointer"
          onClick={() => setIsThumbnail(prev => !prev)}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
            isThumbnail ? "bg-pink-700 border-pink-700" : "border-pink-300 bg-white"
          }`}>
            {isThumbnail && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-pink-900 font-bold">Set as thumbnail</span>
        </label>

        <div className="flex justify-between items-center gap-3">
          {/* Delete — only for existing images */}
          {image && (
            <button
              onClick={() => {
                if (window.confirm("Delete this image permanently?")) onDelete();
              }}
              className="px-5 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button onClick={onClose} className="px-5 py-2 rounded-full border border-pink-400 text-pink-700 hover:bg-pink-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onSave({ file, dateTaken, locationTaken, isThumbnail, previewUrl: preview })}
              className="px-5 py-2 rounded-full bg-pink-700 text-white hover:bg-pink-800 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WildlifeDetails() {
  const { admin } = useContext(AdminContext);
  const { category, wildlifeId } = useParams();
  
  const [wildlife, setWildlife] = useState(null);
  const [filteredData, setFilteredData] = useState({});
  const [categoryId, setCategoryId] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [images, setImages] = useState([]);
  const [imageClicked, setImageClicked] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isNew = wildlifeId === "new";
  const [editingImage, setEditingImage] = useState(null)
  const [pendingThumbnail, setPendingThumbnail] = useState(null);
  const [pendingImages, setPendingImages] = useState([]); 

  const BASE_IMG_URL = "http://127.0.0.1:5000/api/get-image/";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldsResponse = await apiService.getCategoriesAndFields(category);
        const categoryEntry = Object.values(fieldsResponse.categories).find(
          (c) => c.name.toLowerCase() === category.toLowerCase()
        );
        const fieldNames = (categoryEntry?.field_ids || []).map(
          (id) => fieldsResponse.fields[id]
        );


        if (isNew) {
          const blankData = {};
          fieldNames.forEach(field => {
            blankData[field.name] = "";
          });


          setWildlife({ name: "", scientific_name: "" });
          setFilteredData(blankData);
          setImages([]);
        } else {
          const data = await apiService.getWildlifeById(wildlifeId, category);
          console.log("wildlife data:", data);  
          const wildlifeImages = await apiService.getImagesByWildlifeId(data.id, category);

          setWildlife(data);
          setCategoryId(data.category_id);
          setImages(wildlifeImages);

          // Use thumbnail_id to find the right image, fall back to first
          const thumbnailImg = wildlifeImages.find(img => img.id == data.thumbnail_id) 
            || wildlifeImages[0];
          if (thumbnailImg) {
            setThumbnail(thumbnailImg.image_path);
            setHighlight(thumbnailImg.image_path);
          }

          const { id, scientific_name, name, category_id, thumbnail_id, ...rest } = data;
          setFilteredData(rest);
      }
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchData();
  }, [wildlifeId, category, isNew]);

  const handleInputChange = (key, value) => {
    setFilteredData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedWildlifeId = isNew ? null : parseInt(wildlifeId);

      const payload = {
        ...filteredData,
        name: wildlife.name,
        scientific_name: wildlife.scientific_name,
        // remove category_id from here entirely — pass it separately below
      };

      if (isNew) {
        const result = await apiService.createWildlife(categoryId, payload);
        savedWildlifeId = result.wildlife_id;
      } else {
        await apiService.updateWildlife(wildlifeId, categoryId, payload);  // ← categoryId, not category
      }

      for (const pending of pendingImages) {
        if (!pending.file) continue;

        const isReplacement = typeof pending.tempId !== 'string' || 
          !pending.tempId.startsWith('pending-');

        let savedImageId;

        if (isReplacement) {
          // Edit of existing image — replace in place
          const result = await apiService.replaceImage(pending.tempId, pending.file);
          savedImageId = pending.tempId; // ID stays the same
        } else {
          // Brand new image
          const result = await apiService.saveImage(
            savedWildlifeId, pending.file, pending.dateTaken, pending.locationTaken
          );
          savedImageId = result?.image_id;
        }

        if (pending.isThumbnail && savedImageId) {
          await apiService.setThumbnail({
            wildlife_id: savedWildlifeId,
            thumbnail_id: savedImageId,
          });
          setWildlife(prev => ({ ...prev, thumbnail_id: savedImageId }));  // ← keep in sync
          setThumbnail(images.find(img => img.id === savedImageId)?.image_path || thumbnail);
        }
      }

      if (pendingThumbnail && !pendingThumbnail.startsWith("blob:")) {
        const matchedImage = images.find(
          img => `${BASE_IMG_URL}${img.image_path}` === pendingThumbnail
        );
        if (matchedImage && !matchedImage.isPending) {
          await apiService.setThumbnail({
            wildlife_id: savedWildlifeId,
            thumbnail_id: matchedImage.id,
          });
          setWildlife(prev => ({ ...prev, thumbnail_id: matchedImage.id }));
        }
      }

      setPendingThumbnail(null);
      setPendingImages([]);
      alert("Changes saved!");
    } catch (error) {
      console.error("Full error response:", error.response?.data);
      alert("Save failed: " + JSON.stringify(error.response?.data));
    } finally {
      setIsSaving(false);
    }
  };

  if (!wildlife) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-sand-50/30 pb-20">
      {/* 1. Header Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={pendingThumbnail || `${BASE_IMG_URL}${thumbnail}`}
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
          alt="background"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-sand-50">
          <Link to={`/${category}`} className="absolute top-4 left-4 text-sm md:text-base hover:underline">
            ← Back to Database
          </Link>
          {admin ? (
            <div className="flex flex-col gap-2 items-center w-full max-w-md">
              <input
                type="text"
                placeholder="Common Name"
                className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-center bg-transparent border-b-2 border-pink-400 outline-none w-full placeholder:text-sand-200/50"
                value={wildlife?.name || ""}
                onChange={(e) => setWildlife({...wildlife, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Scientific Name"
                className="text-xl md:text-2xl font-['Playfair_Display'] italic mt-2 opacity-90 bg-transparent border-b border-pink-300 outline-none text-center w-full placeholder:text-sand-200/50"
                value={wildlife?.scientific_name || ""}
                onChange={(e) => setWildlife({...wildlife, scientific_name: e.target.value})}
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-center">
                {wildlife.name}
              </h1>
              <p className="text-xl md:text-2xl font-['Playfair_Display'] italic mt-2 opacity-90">
                {wildlife.scientific_name}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-6xl mx-auto -mt-10 relative z-10 px-4">
        <div className="bg-sand-50 rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row p-6 gap-8">
          
          {/* Left Column: Info Card (Original Layout + Admin Inputs) */}
          <div className="lg:w-5/12 bg-sand-100/70 p-8 rounded-2xl border border-sand-200/50">
            {Object.entries(filteredData).map(([key, value]) => (
              <div key={key} className="mb-6">
                <h3 className="text-sand-600 font-bold text-xl capitalize mb-1">
                  {key.replace("_", " ")}
                </h3>
                
                {admin ? (
                  <textarea
                    value={value || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full p-3 bg-white border-2 border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-500 transition-colors resize-none font-sans"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {value || "No information available."}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="lg:w-7/12 flex flex-col">
            <div className="relative group cursor-zoom-in">
              <img
                src={highlight?.startsWith("blob:") || highlight?.startsWith("http") 
                  ? highlight 
                  : `${BASE_IMG_URL}${highlight}`}
                alt={wildlife.name}
                className="w-full h-[400px] object-cover rounded-2xl shadow-md transition-transform"
                onClick={() => !admin && setImageClicked(highlight)}
              />
              {admin && (
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer"
                  onClick={() => setEditingImage(
                    images.find(img => img.image_path === highlight || img.previewUrl === highlight) || "new"
                  )}
                >
                  <Camera className="text-white w-12 h-12" />
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex items-center justify-center mt-6 gap-4 overflow-x-auto p-2 scrollbar-hide">
              <div className="flex gap-3 items-center">
                {images.map((img) => {
                  const src = img.isPending ? img.previewUrl : `${BASE_IMG_URL}${img.image_path}`;
                  return (
                    <div key={img.id} className="relative">
                      <img
                        src={src}
                        className={`w-24 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                          (img.isPending ? img.previewUrl : img.image_path) === highlight
                            ? "ring-4 ring-sand-500 scale-105"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setHighlight(img.isPending ? img.previewUrl : img.image_path)}
                      />
                    </div>
                  );
                })}
                {admin && (
                  <button
                    onClick={() => setEditingImage("new")}
                    className="w-24 h-20 border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors text-2xl font-bold"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </div> 
        </div>

        {/* Fixed Admin Save Bar */}
        {admin && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-full shadow-2xl border border-pink-100 flex items-center gap-6 z-50">
            <p className="text-pink-700 font-bold text-sm">Admin Mode Active</p>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-pink-700 hover:bg-pink-800 text-white px-6 py-2 rounded-full font-bold transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
        {/* Fullscreen Modal */}
        {imageClicked && (
          <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={() => setImageClicked(null)}
          >
            <img
              src={highlight?.startsWith("blob:") ? highlight : `${BASE_IMG_URL}${highlight}`}
              alt={wildlife.name}
              className="max-h-full max-w-full object-cover rounded-2xl shadow-md transition-transform"
              onClick={() => !admin && setImageClicked(highlight)}
            />
            <button className="absolute top-5 right-5 text-white text-3xl">&times;</button>
          </div>
        )}
        {editingImage !== null && (
          <ImageEditModal
            image={editingImage === "new" ? null : editingImage}
            baseUrl={BASE_IMG_URL}
            currentThumbnailId={wildlife?.thumbnail_id}
            onClose={() => setEditingImage(null)}
            onDelete={async () => {
              try {
                await apiService.deleteImage(editingImage.id);
                setImages(prev => prev.filter(img => img.id !== editingImage.id));
                // If deleted image was highlighted, reset to first remaining
                if (editingImage.image_path === thumbnail) {
                  const remaining = images.filter(img => img.id !== editingImage.id);
                  setThumbnail(remaining[0]?.image_path || null);
                }
                if (highlight === editingImage.image_path) {
                  const remaining = images.filter(img => img.id !== editingImage.id);
                  setHighlight(remaining[0]?.image_path || null);
                }
                setEditingImage(null);
              } catch (err) {
                alert("Failed to delete image.");
              }
            }}
            onSave={(data) => {
              const isExisting = editingImage !== "new" && editingImage !== null;

              if (data.file) {
                const tempEntry = {
                  id: isExisting ? editingImage.id : `pending-${Date.now()}`,
                  image_path: isExisting ? editingImage.image_path : null,
                  previewUrl: data.previewUrl,
                  isPending: true,
                };

                if (isExisting) {
                  // Replace the existing entry in images array
                  setImages(prev => prev.map(img =>
                    img.id === editingImage.id ? tempEntry : img
                  ));
                  // If this was the highlighted image, update highlight
                  if (highlight === editingImage.image_path) {
                    setHighlight(data.previewUrl);
                  }
                } else {
                  // New image — append
                  setImages(prev => [...prev, tempEntry]);
                  setHighlight(data.previewUrl);
                }

                setPendingImages(prev => {
                  // Replace existing pending entry if re-editing, otherwise append
                  const exists = prev.find(p => p.tempId === tempEntry.id);
                  if (exists) {
                    return prev.map(p => p.tempId === tempEntry.id ? { ...data, tempId: tempEntry.id } : p);
                  }
                  return [...prev, { ...data, tempId: tempEntry.id }];
                });
              }

              // Handle thumbnail update — works for both new file and existing image
              if (data.isThumbnail) {
                const newThumb = data.file
                  ? data.previewUrl
                  : `${BASE_IMG_URL}${editingImage.image_path}`;
                setPendingThumbnail(newThumb);
                setThumbnail(isExisting && !data.file ? editingImage.image_path : thumbnail);
              }

              setEditingImage(null);
            }}
          />
        )}
      </div>
    </div>
  );
}