// currently not using this but preserving it in case we want to restructure later

// src/services/api.js
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
  // ... other methods

  getTest: async () => {
    try {
      const response = await api.get("/api");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getCategoriesAndFields: async (dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-categories-and-fields?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get("/api/get-categories");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  searchWildlifeNames: async (query, categoryIds = []) => {
    try {
      // Construct the parameters object
      let params = new URLSearchParams();
      params.append("query", query);

      // If categoryIds are provided, append each one to the params
      categoryIds.forEach(id => params.append("category_id", id));

      // Make the GET request with axios, including the parameters
      const response = await axios.get(`/api/search-wildlife-names/`, {
        params: params
      });
      return response.data; // Return the data from the response
    } catch (error) {
      handleError(error);
    }
  },

  getAllWildlife: async (dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-wildlife?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getWildlifeById: async (wildlifeId, dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-wildlife-by-id/${wildlifeId}?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getImagesByWildlifeId: async (wildlifeId, dataset = 'butterflies') => {
    console.log("getImagesByWildlifeId", wildlifeId);
    try {
      const response = await api.get(`/api/get-images-by-wildlife-id/${wildlifeId}?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  getImagebyImageId: async (imageId, dataset = 'butterflies') => {
    try {
      const response = await api.get(`/api/get-image-by-image-id/${imageId}?dataset=${dataset}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  createCategory: async form => {
    try {
      const response = await api.post(`/api/create-category/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  createField: async form => {
    try {
      const response = await api.post(`/api/create-field/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  editField: async form => {
    try {
      const response = await api.post(`/api/edit-field/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

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

  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/api/delete_image/?id=${imageId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  addImage: async form => {
    console.log("addImage", form);
    try {
      const response = await api.post(`/api/add-image/`, form);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

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


  editWildlife: async form => {
    try {
      const response = await api.post(`/api/edit-wildlife`, form);
      for (const pair of form.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteWildlife: async (wildlifeId) => {
    try {
      const response = await api.delete(`/api/delete-wildlife/?id=${wildlifeId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

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

  adminLogin: async (password) => {
    try {
      console.log("Calling /api/admin-login with password:", password);
      const response = await api.post("/api/admin-login", { password });
      console.log("Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  adminVerify: async (token) => {
    try {
      const response = await api.post("/api/admin-verify", { token });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

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
