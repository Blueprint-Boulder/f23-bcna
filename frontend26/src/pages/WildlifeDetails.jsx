/**
 * WildlifeDetails displays a single wildlife record, including editable fields and gallery management.
 * Admin users can update fields, reorder metadata, upload images, and manage thumbnails.
 */
import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { AdminContext } from "../services/adminContext";
import { X, Camera, Trash, GripVertical } from "lucide-react";

// ImageEditModal shows the image upload/edit form in a modal.
// It handles previewing a file, editing metadata, and optionally deleting the image.
function ImageEditModal({ image, baseUrl, onClose, onSave, onDelete, currentThumbnailId }) {
  const [preview, setPreview] = useState(image?.image_path ? `${baseUrl}${image.image_path}` : null);
  const [file, setFile] = useState(null);
  const [dateTaken, setDateTaken] = useState(image?.date_taken || "");
  const [locationTaken, setLocationTaken] = useState(image?.location_taken || "");
  const [isThumbnail, setIsThumbnail] = useState(image?.id != null ? image.id == currentThumbnailId : false);

  // handleFileChange stores the selected image file and generates a local preview URL.
  const handleFileChange = e => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm p-6 shadow-2xl bg-pink-50 rounded-2xl">
        <h2 className="mb-4 text-xl font-bold text-center text-pink-900">Edit Image Details</h2>

        <label className="block mb-4 cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {preview ? (
            <div className="relative overflow-hidden group rounded-xl">
              <img src={preview} className="object-cover w-full h-48 rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100 rounded-xl">
                <Camera className="w-10 h-10 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-48 bg-pink-100 border-4 border-pink-400 border-dashed rounded-xl">
              <span className="text-5xl font-light text-pink-500">+</span>
            </div>
          )}
        </label>

        <div className="mb-3">
          <label className="block mb-1 font-bold text-pink-900">Date taken</label>
          <input
            type="text"
            placeholder="MM/DD/YYYY"
            value={dateTaken}
            onChange={e => setDateTaken(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border border-pink-200 rounded-lg placeholder:text-gray-300 focus:outline-none focus:border-pink-500"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold text-pink-900">Location taken</label>
          <input
            type="text"
            placeholder="City, State"
            value={locationTaken}
            onChange={e => setLocationTaken(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border border-pink-200 rounded-lg placeholder:text-gray-300 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Thumbnail Checkbox */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer" onClick={() => setIsThumbnail(prev => !prev)}>
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
              isThumbnail ? "bg-pink-700 border-pink-700" : "border-pink-300 bg-white"
            }`}
          >
            {isThumbnail && <span className="text-xs font-bold text-white">✓</span>}
          </div>
          <span className="font-bold text-pink-900">Set as thumbnail</span>
        </label>

        <div className="flex items-center justify-between gap-3">
          {/* Delete — only for existing images */}
          {image && (
            <button
              onClick={() => {
                if (window.confirm("Delete this image permanently?")) onDelete();
              }}
              className="px-5 py-2 text-red-600 transition-colors border border-red-300 rounded-full hover:bg-red-50"
            >
              Delete
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2 text-pink-700 transition-colors border border-pink-400 rounded-full hover:bg-pink-100"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({ file, dateTaken, locationTaken, isThumbnail, previewUrl: preview })}
              className="px-5 py-2 text-white transition-colors bg-pink-700 rounded-full hover:bg-pink-800"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseExifDateTime(exifString) {
  if (!exifString) return null;

  const [datePart, timePart] = exifString.split(" ");
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split(":");
  const [hour, minute, second] = timePart.split(":");

  return new Date(
    Number(year),
    Number(month) - 1, // JS months are 0-based
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
}

// FullscreenModal displays a large image preview and optionally renders
// a watermarked version of the selected wildlife photo.
function FullscreenModal({ src, wildlife, images, highlight, onClose }) {
  const [watermarkedSrc, setWatermarkedSrc] = useState(null);

  const matchedImage = images.find(img => img.image_path === highlight || img.previewUrl === highlight);

  // useEffect(() => {
  //   const metadata = {
  //     name: wildlife?.name || "",
  //     scientific_name: wildlife?.scientific_name || "",
  //     dateTaken: matchedImage?.date_taken || "",
  //     locationTaken: matchedImage?.location_taken || ""
  //   };
  //   buildWatermarkedCanvas(src, metadata).then(setWatermarkedSrc);
  // }, [src, matchedImage, wildlife]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/95" onClick={onClose}>
      <img
        src={src}
        alt={wildlife?.name}
        className="object-contain max-w-full max-h-full rounded-xl"
        onClick={e => e.stopPropagation()}
        onContextMenu={e => e.preventDefault()}
      />
      <div className="absolute bottom-0 w-full p-4 text-center text-white bg-black/50">
        <p>{wildlife.name}</p>
        <p>{wildlife.scientific_name}</p>
        <p>{parseExifDateTime(matchedImage.metadata.datetime).toLocaleDateString()}</p>
        <p>{matchedImage.metadata.model}</p>
      </div>
      <button className="absolute text-3xl text-white top-5 right-5" onClick={onClose}>
        &times;
      </button>
    </div>
  );
}

// WildlifeDetails is the main detail page for a single wildlife entity.
// It supports viewing, editing, image management, and metadata ordering.
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
  const [editingImage, setEditingImage] = useState(null);
  const [pendingThumbnail, setPendingThumbnail] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);

  const [fieldOrder, setFieldOrder] = useState([]); // array of field name strings
  const [fieldsNameToId, setFieldsNameToId] = useState({}); // { fieldName: fieldId }
  const [orderDirty, setOrderDirty] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const BASE_IMG_URL = "http://127.0.0.1:5000/api/get-image/";

  // Load category metadata and wildlife record data whenever the route changes.
  // When creating a new wildlife item, initialize blank fields. Otherwise load
  // the existing entry and its images.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fieldsResponse = await apiService.getCategoriesAndFields(category);
        const categoryEntry = Object.values(fieldsResponse.categories).find(
          c => c.name.toLowerCase() === category.toLowerCase()
        );

        const fieldNames = (categoryEntry?.field_ids || []).map(id => fieldsResponse.fields[id]).filter(Boolean);

        if (isNew) {
          setCategoryId(categoryEntry?.id);
          const blankData = {};
          fieldNames.forEach(field => {
            blankData[field.name] = "";
          });
          setWildlife({ name: "", scientific_name: "" });
          setFilteredData(blankData);
          const nameToId = {};
          fieldNames.forEach(f => {
            nameToId[f.name] = f.id;
          });
          setFieldsNameToId(nameToId);
          setFieldOrder(fieldNames.map(f => f.name));
          setImages([]);
        } else {
          const data = await apiService.getWildlifeById(wildlifeId, category);
          const wildlifeImages = await apiService.getImagesByWildlifeId(data.id, category);

          setWildlife(data);
          setCategoryId(data.category_id);
          setImages(wildlifeImages);

          const thumbnailImg = wildlifeImages.find(img => img.id == data.thumbnail_id) || wildlifeImages[0];
          if (thumbnailImg) {
            setThumbnail(thumbnailImg.image_path);
            setHighlight(thumbnailImg.image_path);
          }

          const {
            id: _id,
            scientific_name: _scientific_name,
            name: _name,
            category_id: _category_id,
            thumbnail_id: _thumbnail_id,
            ...rest
          } = data;
          const allFieldData = {};
          fieldNames.forEach(field => {
            allFieldData[field.name] = rest[field.name] ?? "";
          });
          setFilteredData(allFieldData);
          const nameToId = {};
          fieldNames.forEach(f => {
            nameToId[f.name] = f.id;
          });
          setFieldsNameToId(nameToId);
          const orderedNames = fieldNames.map(f => f.name).filter(Boolean);
          setFieldOrder(orderedNames);
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

  // handleSave persists either a new or existing wildlife entry,
  // then uploads any pending image changes and applies thumbnail selection.
  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedWildlifeId = isNew ? null : parseInt(wildlifeId);

      const payload = {
        ...filteredData,
        name: wildlife.name,
        scientific_name: wildlife.scientific_name
        // remove category_id from here entirely — pass it separately below
      };

      if (isNew) {
        const result = await apiService.createWildlife(categoryId, payload, null, category);
        savedWildlifeId = result.wildlife_id;
      } else {
        await apiService.updateWildlife(wildlifeId, categoryId, payload, category);
      }

      for (const pending of pendingImages) {
        if (!pending.file) continue;

        const isReplacement = typeof pending.tempId !== "string" || !pending.tempId.startsWith("pending-");

        let savedImageId;

        if (isReplacement) {
          // Edit of existing image — replace in place
          await apiService.replaceImage(pending.tempId, pending.file, category);
          savedImageId = pending.tempId; // ID stays the same
        } else {
          // Brand new image
          const result = await apiService.saveImage(
            savedWildlifeId,
            pending.file,
            pending.dateTaken,
            pending.locationTaken,
            category
          );
          savedImageId = result?.image_id;
        }

        if (pending.isThumbnail && savedImageId) {
          await apiService.setThumbnail({
            wildlife_id: savedWildlifeId,
            thumbnail_id: savedImageId,
            dataset: category
          });
          setWildlife(prev => ({ ...prev, thumbnail_id: savedImageId })); // ← keep in sync
          setThumbnail(images.find(img => img.id === savedImageId)?.image_path || thumbnail);
        }
      }

      if (pendingThumbnail && !pendingThumbnail.startsWith("blob:")) {
        const matchedImage = images.find(img => `${BASE_IMG_URL}${img.image_path}` === pendingThumbnail);
        if (matchedImage && !matchedImage.isPending) {
          await apiService.setThumbnail({
            wildlife_id: savedWildlifeId,
            thumbnail_id: matchedImage.id,
            dataset: category
          });
          setWildlife(prev => ({ ...prev, thumbnail_id: matchedImage.id }));
        }
      }

      setPendingThumbnail(null);
      if (orderDirty) {
        const orderedFieldIds = fieldOrder.map(name => fieldsNameToId[name]).filter(Boolean);
        await apiService.reorderFields(categoryId, orderedFieldIds, category);
        setOrderDirty(false);
      }
      setPendingImages([]);
      alert("Changes saved!");
    } catch (error) {
      console.error("Full error:", error); // the error object itself
      console.error("Message:", error.message); // always exists
      console.error("Stack:", error.stack); // tells you where it threw
      alert("Save failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${wildlife.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await apiService.deleteWildlife(wildlifeId, category);
      alert("Successfully deleted.");
      navigate(-1); // or navigate("/admin") — wherever your list lives
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed: " + error.message);
    }
  };

  if (!wildlife) return <div className="p-10 text-center">Loading...</div>;

  const handleDragStart = index => {
    dragItem.current = index;
  };
  const handleDragEnter = index => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newOrder = [...fieldOrder];
    const [dragged] = newOrder.splice(dragItem.current, 1);
    newOrder.splice(dragOverItem.current, 0, dragged);
    setFieldOrder(newOrder);
    setOrderDirty(true);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="min-h-screen pb-20 bg-sand-50/30">
      {/* 1. Header Section */}
      <div className="relative h-64 overflow-hidden md:h-80">
        <img
          src={pendingThumbnail || `${BASE_IMG_URL}${thumbnail}`}
          className="absolute inset-0 object-cover w-full h-full scale-110 blur-md"
          alt="background"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-sand-50">
          <Link to={`/${category}`} className="absolute text-sm top-4 left-4 md:text-base hover:underline">
            ← Back to Database
          </Link>
          {admin ? (
            <div className="flex flex-col items-center gap-2 w-max">
              <input
                type="text"
                placeholder="Common Name"
                className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-center bg-transparent border-b-2 border-pink-400 outline-none w-full placeholder:text-sand-200/50"
                value={wildlife?.name || ""}
                onChange={e => setWildlife({ ...wildlife, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Scientific Name"
                className="text-xl md:text-2xl font-['Playfair_Display'] italic mt-2 opacity-90 bg-transparent border-b border-pink-300 outline-none text-center w-full placeholder:text-sand-200/50"
                value={wildlife?.scientific_name || ""}
                onChange={e => setWildlife({ ...wildlife, scientific_name: e.target.value })}
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-center">{wildlife.name}</h1>
              <p className="text-xl md:text-2xl font-['Playfair_Display'] italic mt-2 opacity-90">
                {wildlife.scientific_name}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 max-w-6xl px-4 mx-auto -mt-10">
        <div className="flex flex-col gap-8 p-6 overflow-hidden shadow-2xl bg-sand-50 rounded-xl lg:flex-row">
          {/* Left Column: Info Card (Original Layout + Admin Inputs) */}
          <div className="p-8 border lg:w-5/12 bg-sand-100/70 rounded-2xl border-sand-200/50">
            {fieldOrder.map((key, index) => (
              <div
                key={key}
                className={`mb-6 ${admin ? "cursor-grab active:cursor-grabbing" : ""}`}
                draggable={admin}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  {admin && <GripVertical className="flex-shrink-0 w-4 h-4 -ml-1 text-pink-300 hover:text-pink-500" />}
                  <h3 className="mb-1 text-xl font-bold capitalize text-sand-600">{key.replace("_", " ")}</h3>
                </div>

                {admin ? (
                  <textarea
                    value={filteredData[key] || ""}
                    onChange={e => handleInputChange(key, e.target.value)}
                    className="w-full p-3 font-sans text-gray-800 transition-colors bg-white border-2 border-pink-200 resize-none rounded-xl focus:outline-none focus:border-pink-500"
                    rows={2}
                  />
                ) : (
                  <p className="leading-relaxed text-gray-700">{filteredData[key] || "No information available."}</p>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col lg:w-7/12">
            <div className="relative group cursor-zoom-in">
              <img
                src={
                  highlight?.startsWith("blob:") || highlight?.startsWith("http")
                    ? highlight
                    : `${BASE_IMG_URL}${highlight}`
                }
                alt={wildlife.name}
                className="w-full h-[400px] object-cover rounded-2xl shadow-md transition-transform"
                onClick={() => !admin && setImageClicked(highlight)}
              />
              {admin && (
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 cursor-pointer bg-black/40 group-hover:opacity-100 rounded-2xl"
                  onClick={() =>
                    setEditingImage(
                      images.find(img => img.image_path === highlight || img.previewUrl === highlight) || "new"
                    )
                  }
                >
                  <Camera className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex items-center justify-center gap-4 p-2 mt-6 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-3">
                {images.map(img => {
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
                    className="flex items-center justify-center w-24 h-20 text-2xl font-bold text-pink-500 transition-colors border-2 border-pink-300 border-dashed rounded-lg hover:bg-pink-50"
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
          <div className="fixed z-50 flex items-center gap-6 px-8 py-4 -translate-x-1/2 bg-white border border-pink-100 rounded-full shadow-2xl bottom-8 left-1/2">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="flex gap-2 px-6 py-2 font-bold text-red-600 transition-all border border-red-300 rounded-full hover:bg-red-50"
              >
                <Trash /> Destroy
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 font-bold text-white transition-all bg-pink-700 rounded-full hover:bg-pink-800 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
        {/* Fullscreen Modal */}
        {imageClicked && (
          <FullscreenModal
            src={highlight?.startsWith("blob:") ? highlight : `${BASE_IMG_URL}${highlight}`}
            wildlife={wildlife}
            images={images}
            highlight={highlight}
            BASE_IMG_URL={BASE_IMG_URL}
            onClose={() => setImageClicked(null)}
          />
        )}
        {editingImage !== null && (
          <ImageEditModal
            image={editingImage === "new" ? null : editingImage}
            baseUrl={BASE_IMG_URL}
            currentThumbnailId={wildlife?.thumbnail_id}
            onClose={() => setEditingImage(null)}
            onDelete={async () => {
              // Don't attempt server delete for unsaved images
              if (String(editingImage.id).startsWith("pending-")) {
                setImages(prev => prev.filter(img => img.id !== editingImage.id));
                setPendingImages(prev => prev.filter(p => p.tempId !== editingImage.id));
                setEditingImage(null);
                return;
              }
              try {
                await apiService.deleteImage(editingImage.id, category);
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
              } catch {
                alert("Failed to delete image.");
              }
            }}
            onSave={data => {
              const isExisting = editingImage !== "new" && editingImage !== null;

              if (data.file) {
                const tempEntry = {
                  id: isExisting ? editingImage.id : `pending-${Date.now()}`,
                  image_path: isExisting ? editingImage.image_path : null,
                  previewUrl: data.previewUrl,
                  isPending: true
                };

                if (isExisting) {
                  // Replace the existing entry in images array
                  setImages(prev => prev.map(img => (img.id === editingImage.id ? tempEntry : img)));
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
                    return prev.map(p => (p.tempId === tempEntry.id ? { ...data, tempId: tempEntry.id } : p));
                  }
                  return [...prev, { ...data, tempId: tempEntry.id }];
                });
              }

              // Handle thumbnail update — works for both new file and existing image
              if (data.isThumbnail) {
                const newThumb = data.file ? data.previewUrl : `${BASE_IMG_URL}${editingImage.image_path}`;
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
