import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  localAuthAPI,
  localUsersAPI,
  localMachinesAPI,
  localMaintenanceAPI,
  localSchedulesAPI,
} from "./local-storage-api";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-72f3dbef`;

// Check if we should use local storage (offline mode)
// Start with localStorage enabled by default for better UX
let useLocalStorage = localStorage.getItem("use_local_storage") !== "false";

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper function to get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("current_user");
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to set auth data
export const setAuthData = (token: string, user: any) => {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("current_user", JSON.stringify(user));
};

// Helper function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user");
};

// Check if using local storage mode
export const isUsingLocalStorage = () => useLocalStorage;

// Enable local storage mode
export const enableLocalStorageMode = () => {
  useLocalStorage = true;
  localStorage.setItem("use_local_storage", "true");
};

// Disable local storage mode (use backend)
export const disableLocalStorageMode = () => {
  useLocalStorage = false;
  localStorage.setItem("use_local_storage", "false");
};

// Check server health
export const checkServerHealth = async () => {
  // Always use localStorage mode by default
  if (!localStorage.getItem("use_local_storage")) {
    enableLocalStorageMode();
  }
  
  // If explicitly set to use local storage
  if (localStorage.getItem("use_local_storage") === "true") {
    useLocalStorage = true;
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      useLocalStorage = false;
      disableLocalStorageMode();
      return true;
    }
    
    enableLocalStorageMode();
    return false;
  } catch (error) {
    console.log("Server not available, using local storage mode");
    enableLocalStorageMode();
    return false;
  }
};

// Generic API request function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["Authorization"] = `Bearer ${publicAnonKey}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`API request error for ${endpoint}:`, error);
    throw new Error(error.message || "Network request failed");
  }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    if (useLocalStorage) {
      return localAuthAPI.login(email, password);
    }
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string, role: string) => {
    if (useLocalStorage) {
      return localAuthAPI.register(name, email, password, role);
    }
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  getCurrentUser: () => {
    if (useLocalStorage) {
      return localAuthAPI.getCurrentUser();
    }
    return apiRequest("/auth/me");
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    if (useLocalStorage) {
      return localUsersAPI.getAll();
    }
    return apiRequest("/users");
  },
  create: async (user: any) => {
    if (useLocalStorage) {
      return localUsersAPI.create(user);
    }
    return apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  },
  update: async (id: string, user: any) => {
    if (useLocalStorage) {
      return localUsersAPI.update(id, user);
    }
    return apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  },
  delete: async (id: string) => {
    if (useLocalStorage) {
      return localUsersAPI.delete(id);
    }
    return apiRequest(`/users/${id}`, {
      method: "DELETE",
    });
  },
};

// Machines API
export const machinesAPI = {
  getAll: async () => {
    if (useLocalStorage) {
      return localMachinesAPI.getAll();
    }
    return apiRequest("/machines");
  },
  create: async (machine: any) => {
    if (useLocalStorage) {
      return localMachinesAPI.create(machine);
    }
    return apiRequest("/machines", {
      method: "POST",
      body: JSON.stringify(machine),
    });
  },
  update: async (id: string, machine: any) => {
    if (useLocalStorage) {
      return localMachinesAPI.update(id, machine);
    }
    return apiRequest(`/machines/${id}`, {
      method: "PUT",
      body: JSON.stringify(machine),
    });
  },
  delete: async (id: string) => {
    if (useLocalStorage) {
      return localMachinesAPI.delete(id);
    }
    return apiRequest(`/machines/${id}`, {
      method: "DELETE",
    });
  },
};

// Maintenance API
export const maintenanceAPI = {
  getAll: async () => {
    if (useLocalStorage) {
      return localMaintenanceAPI.getAll();
    }
    return apiRequest("/maintenance");
  },
  create: async (record: any) => {
    if (useLocalStorage) {
      return localMaintenanceAPI.create(record);
    }
    return apiRequest("/maintenance", {
      method: "POST",
      body: JSON.stringify(record),
    });
  },
  update: async (id: string, record: any) => {
    if (useLocalStorage) {
      return localMaintenanceAPI.update(id, record);
    }
    return apiRequest(`/maintenance/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
    });
  },
  delete: async (id: string) => {
    if (useLocalStorage) {
      return localMaintenanceAPI.delete(id);
    }
    return apiRequest(`/maintenance/${id}`, {
      method: "DELETE",
    });
  },
};

// Schedules API
export const schedulesAPI = {
  getAll: async () => {
    if (useLocalStorage) {
      return localSchedulesAPI.getAll();
    }
    return apiRequest("/schedules");
  },
  create: async (schedule: any) => {
    if (useLocalStorage) {
      return localSchedulesAPI.create(schedule);
    }
    return apiRequest("/schedules", {
      method: "POST",
      body: JSON.stringify(schedule),
    });
  },
  update: async (id: string, schedule: any) => {
    if (useLocalStorage) {
      return localSchedulesAPI.update(id, schedule);
    }
    return apiRequest(`/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(schedule),
    });
  },
  delete: async (id: string) => {
    if (useLocalStorage) {
      return localSchedulesAPI.delete(id);
    }
    return apiRequest(`/schedules/${id}`, {
      method: "DELETE",
    });
  },
};