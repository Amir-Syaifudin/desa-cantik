import { apiClient } from "./apiClient";

export const dataApi = {
  async listVillages(params) {
    const response = await apiClient.get("/villages", { params });
    return {
      items: response?.data || [],
      meta: response?.meta || null,
    };
  },

  async createVillage(payload) {
    const response = await apiClient.post("/villages", payload);
    return response?.data;
  },

  async updateVillage(id, payload) {
    const response = await apiClient.put(`/villages/${id}`, payload);
    return response?.data;
  },

  async toggleVillageStatus(id, isActive) {
    const response = await apiClient.put(`/villages/${id}/toggle-status`, {
      is_active: isActive,
    });
    return response?.data;
  },

  async getVillage(id) {
    const response = await apiClient.get(`/villages/${id}`);
    return response?.data;
  },

  async listPublications(villageId, params) {
    const response = await apiClient.get(
      `/villages/${villageId}/publications`,
      {
        params,
      }
    );
    return {
      items: response?.data || [],
      meta: response?.meta || null,
    };
  },

  async uploadPublication(villageId, payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = await apiClient.post(
      `/villages/${villageId}/publications`,
      formData
    );
    return response?.data;
  },

  async updatePublication(villageId, publicationId, payload) {
    const response = await apiClient.put(
      `/villages/${villageId}/publications/${publicationId}`,
      payload
    );
    return response?.data;
  },

  async replacePublicationFile(villageId, publicationId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(
      `/villages/${villageId}/publications/${publicationId}/replace-file`,
      formData
    );
    return response?.data;
  },

  async deletePublication(villageId, publicationId) {
    return apiClient.delete(
      `/villages/${villageId}/publications/${publicationId}`
    );
  },

  async listStatistics(villageId, params) {
    const response = await apiClient.get(`/villages/${villageId}/statistics`, {
      params,
    });
    return {
      items: response?.data || [],
      meta: response?.meta || null,
    };
  },

  async createStatistic(villageId, payload) {
    // Check if payload is FormData, if not convert it or leave as is?
    // If it contains file, it should be FormData.
    const response = await apiClient.post(
      `/villages/${villageId}/statistics`,
      payload
    );
    return response?.data;
  },

  async updateStatistic(villageId, statisticId, payload) {
    let data = payload;
    let method = "put";
    let url = `/villages/${villageId}/statistics/${statisticId}`;

    if (payload instanceof FormData) {
      method = "post";
      payload.append("_method", "PUT");
      data = payload;
    }

    const response = await apiClient.request(method, url, { data });
    return response?.data;
  },

  async deleteStatistic(villageId, statisticId) {
    return apiClient.delete(`/villages/${villageId}/statistics/${statisticId}`);
  },

  async listStatisticTypes() {
    const response = await apiClient.get("/statistic-types", {
      params: { per_page: 100 },
    });
    return response?.data || [];
  },

  async listGeospatial(villageId) {
    const response = await apiClient.get(`/villages/${villageId}/geospatial`);
    return response?.data || [];
  },

  async createGeospatial(villageId, payload) {
    const response = await apiClient.post(
      `/villages/${villageId}/geospatial`,
      payload
    );
    return response?.data;
  },

  async updateGeospatial(villageId, geoId, payload) {
    const response = await apiClient.put(
      `/villages/${villageId}/geospatial/${geoId}`,
      payload
    );
    return response?.data;
  },

  async deleteGeospatial(villageId, geoId) {
    return apiClient.delete(`/villages/${villageId}/geospatial/${geoId}`);
  },

  async listThematicMaps(villageId) {
    const response = await apiClient.get(
      `/villages/${villageId}/thematic-maps`
    );
    return response?.data || [];
  },

  async createThematicMap(villageId, payload) {
    const response = await apiClient.post(
      `/villages/${villageId}/thematic-maps`,
      payload
    );
    return response?.data;
  },

  async updateThematicMap(villageId, mapId, payload) {
    const response = await apiClient.put(
      `/villages/${villageId}/thematic-maps/${mapId}`,
      payload
    );
    return response?.data;
  },

  async deleteThematicMap(villageId, mapId) {
    return apiClient.delete(`/villages/${villageId}/thematic-maps/${mapId}`);
  },

  async getThematicMap(mapId) {
    const response = await apiClient.get(`/thematic-maps/${mapId}`);
    return response?.data;
  },

  async dashboardAdmin() {
    const response = await apiClient.get("/dashboard/admin");
    return response?.data;
  },

  async dashboardVillage(villageId) {
    const response = await apiClient.get("/dashboard/village", {
      params: { village_id: villageId },
    });
    return response?.data;
  },

  async updatePassword(currentPassword, newPassword) {
    const response = await apiClient.put("/auth/password", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
    return response?.data;
  },

  async resetUserPassword(userId, newPassword) {
    const response = await apiClient.put(`/users/${userId}/reset-password`, {
      password: newPassword,
      password_confirmation: newPassword,
    });
    return response?.data;
  },

  async listUsers(params) {
    const response = await apiClient.get("/users", { params });
    return {
      items: response?.data || [],
      meta: response?.meta || null,
    };
  },
};
