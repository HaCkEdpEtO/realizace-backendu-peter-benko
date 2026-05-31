const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getErrorMessage(data, fallbackMessage) {
  if (!data?.uuAppErrorMap) return fallbackMessage;

  const firstError = Object.values(data.uuAppErrorMap)[0];

  return firstError?.message || fallbackMessage;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Server request failed."));
  }

  return data;
}

function post(path, dtoIn) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(dtoIn)
  });
}

export const plantApi = {
  list() {
    return request("/plant/list");
  },

  get(id) {
    return request(`/plant/get?id=${encodeURIComponent(id)}`);
  },

  create(dtoIn) {
    return post("/plant/create", dtoIn);
  },

  update(dtoIn) {
    return post("/plant/update", dtoIn);
  },

  delete(id) {
    return post("/plant/delete", { id });
  }
};

export const careRecordApi = {
  list(plantId) {
    if (plantId) {
      return request(`/careRecord/list?plantId=${encodeURIComponent(plantId)}`);
    }

    return request("/careRecord/list");
  },

  get(id) {
    return request(`/careRecord/get?id=${encodeURIComponent(id)}`);
  },

  create(dtoIn) {
    return post("/careRecord/create", dtoIn);
  },

  update(dtoIn) {
    return post("/careRecord/update", dtoIn);
  },

  delete(id) {
    return post("/careRecord/delete", { id });
  }
};