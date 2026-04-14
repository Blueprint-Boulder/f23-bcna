/**
 * apiService contains reusable HTTP helpers for the BCNA frontend.
 * It centralizes data fetching and mutation requests for wildlife, images, categories, and admin authentication.
 */
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: BASE_URL
});

const handleError = error => {
  console.error("API Error:", error);
  throw error;
};

const apiService = {
  // getTest is a simple ping endpoint for verifying backend connectivity.
  getTest: async () => {
    try {
      const response = await api.get("/api");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // getCategoriesAndFields returns category metadata and field definitions for a dataset.
  getCategoriesAndFields: async (dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-categories-and-fields?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // getCategories returns all available categories across datasets.
  getCategories: async () => {
    try {
      const response = await api.get("/api/get-categories");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // searchWildlifeNames performs a backend search for wildlife names.
  // Optionally filters by one or more category IDs.
  searchWildlifeNames: async (query, categoryIds = []) => {
    try {
      const params = new URLSearchParams();
      params.append("query", query);
      categoryIds.forEach(id => params.append("category_id", id));
      const response = await api.get(`/api/search-wildlife-names/`, { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // getAllWildlife returns all wildlife entries for the specified dataset.
  getAllWildlife: async (dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-wildlife?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // getWildlifeById fetches a single wildlife record by its ID within the dataset.
  getWildlifeById: async (wildlifeId, dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-wildlife-by-id/${wildlifeId}?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // getImagesByWildlifeId returns all photos associated with a particular wildlife entry.
  getImagesByWildlifeId: async (wildlifeId, dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-images-by-wildlife-id/${wildlifeId}?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // getImageByImageId fetches a single image asset by its image ID.
  getImageByImageId: async (imageId, dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-image-by-image-id/${imageId}?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  // createCategory creates a new category using a FormData payload.
  createCategory: async form => {
    try {
      const response = await api.post(`/api/create-category/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // createField creates a new field definition tied to a category.
  createField: async form => {
    try {
      const response = await api.post(`/api/create-field/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // editField updates an existing field descriptor.
  editField: async form => {
    try {
      const response = await api.post(`/api/edit-field/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // createWildlife sends a new wildlife record and optional thumbnail image to the backend.
  createWildlife: async (categoryId, wildlifeData, imageFile = null, dataset = 'butterflies') => {
    try {
      const form = new FormData();
      form.append("name", wildlifeData.name || "");
      form.append("scientific_name", wildlifeData.scientific_name || "");
      form.append("category_id", categoryId);
      Object.entries(wildlifeData).forEach(([key, value]) => {
        if (!["name", "scientific_name", "category_id"].includes(key)) {
          form.append(key, value);
        }
      });
      if (imageFile) form.append("image_file", imageFile);
      const response = await api.post(`/api/create-wildlife/?dataset=${dataset}`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // updateWildlife edits an existing wildlife record and sends updated values to the backend.
  updateWildlife: async (wildlifeId, categoryId, wildlifeData, dataset = 'butterflies') => {
  try {

    const form = new FormData();
    form.append("wildlife_id", wildlifeId);
    form.append("category_id", categoryId);  // ← direct param, not from wildlifeData
    form.append("name", wildlifeData.name || "");
    form.append("scientific_name", wildlifeData.scientific_name || "");
    Object.entries(wildlifeData).forEach(([key, value]) => {
      if (!["name", "scientific_name", "category_id"].includes(key)) {
        form.append(key, value);
      }
    });
    const response = await api.post(`/api/edit-wildlife/?dataset=${dataset}`, form);
    return response.data;
  } catch (error) {
    handleError(error);
  }
},

  // saveImage uploads a new image for a wildlife entry, including optional metadata.
  saveImage: async (wildlifeId, imageFile, dateTaken = null, locationTaken = null) => {
    try {
      const form = new FormData();
      form.append("wildlife_id", wildlifeId);
      form.append("image_file", imageFile);
      if (dateTaken) form.append("date_taken", dateTaken);
      if (locationTaken) form.append("location_taken", locationTaken);
      const response = await api.post(`/api/add-image/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // replaceImage swaps the file for an existing image record.
  replaceImage: async (imageId, imageFile) => {
    try {
      const form = new FormData();
      form.append("image_file", imageFile);
      const response = await api.put(`/api/replace-image/${imageId}`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // deleteImage removes an image from the backend by image ID.
  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/api/delete_image/?id=${imageId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // addImage is a generic image upload helper for form-based image submission.
  addImage: async form => {
    try {
      const response = await api.post(`/api/add-image/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // setThumbnail marks a specific image as the featured thumbnail for a wildlife entry.
  setThumbnail: async ({ wildlife_id, thumbnail_id }) => {
    try {
      const form = new FormData();
      form.append("wildlife_id", wildlife_id);
      form.append("thumbnail_id", thumbnail_id);
      const response = await api.put(`/api/set-thumbnail`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },


  // editWildlife is an alternate backend endpoint for editing wildlife records.
  // It is kept for compatibility with multiple edit flows.
  editWildlife: async form => {
    try {
      const response = await api.post(`/api/edit-wildlife`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // deleteWildlife removes an entire wildlife record from the dataset.
  deleteWildlife: async (wildlifeId) => {
    try {
      const response = await api.delete(`/api/delete-wildlife/?id=${wildlifeId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // reorderFields updates the field display order for a category.
  reorderFields: async (categoryId, fieldIds, dataset = 'butterflies') => {
    try {
      const form = new FormData();
      form.append("category_id", categoryId);
      fieldIds.forEach(id => form.append("field_ids[]", id));
      const response = await api.post(`/api/reorder-fields/?dataset=${dataset}`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // adminLogin authenticates an admin user and returns a session token.
  adminLogin: async (password) => {
    try {
      const response = await api.post("/api/admin-login", { password });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // adminVerify checks a stored token for validity with the backend.
  adminVerify: async (token) => {
    try {
      const response = await api.post("/api/admin-verify", { token });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // adminLogout informs the backend that the current admin session is ending.
  adminLogout: async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await api.post("/api/admin-logout", { token });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }

};

export default apiService;
