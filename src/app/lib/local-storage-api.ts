// Helper functions
const getFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    // If quota exceeded, try to cleanup old data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('Penyimpanan penuh! Hapus beberapa foto lama untuk melanjutkan.');
    }
    throw error;
  }
};

// Auth API
export const localAuthAPI = {
  login: (email: string, password: string) => {
    const users = getFromStorage("users");
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    if (user.status !== "active") {
      throw new Error("Account is not active");
    }
    
    const token = btoa(`${user.user_id}:${Date.now()}`);
    
    return {
      message: "Login successful",
      token,
      user: { ...user, password: undefined },
    };
  },

  register: (name: string, email: string, password: string, role: string) => {
    const users = getFromStorage("users");
    const emailExists = users.some((u: any) => u.email === email);
    
    if (emailExists) {
      throw new Error("Email already registered");
    }
    
    const userId = crypto.randomUUID();
    const user = {
      user_id: userId,
      name,
      email,
      password,
      role,
      status: "active",
      created_at: new Date().toISOString(),
    };
    
    users.push(user);
    saveToStorage("users", users);
    
    return {
      message: "User registered successfully",
      user: { ...user, password: undefined },
    };
  },

  getCurrentUser: () => {
    // This is handled by localStorage.getItem("current_user") in main API
    return { user: null };
  },
};

// Users API
export const localUsersAPI = {
  getAll: () => {
    const users = getFromStorage("users");
    return { users: users.map((u: any) => ({ ...u, password: undefined })) };
  },

  create: (user: any) => {
    const users = getFromStorage("users");
    const userId = crypto.randomUUID();
    const newUser = {
      user_id: userId,
      ...user,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    saveToStorage("users", users);
    return { user: { ...newUser, password: undefined } };
  },

  update: (id: string, userData: any) => {
    const users = getFromStorage("users");
    const index = users.findIndex((u: any) => u.user_id === id);
    
    if (index === -1) {
      throw new Error("User not found");
    }
    
    users[index] = { ...users[index], ...userData };
    saveToStorage("users", users);
    
    return { user: { ...users[index], password: undefined } };
  },

  delete: (id: string) => {
    const users = getFromStorage("users");
    const filtered = users.filter((u: any) => u.user_id !== id);
    saveToStorage("users", filtered);
    return { message: "User deleted successfully" };
  },
};

// Machines API
export const localMachinesAPI = {
  getAll: () => {
    const machines = getFromStorage("machines");
    return { machines };
  },

  create: (machine: any) => {
    const machines = getFromStorage("machines");
    const machineId = crypto.randomUUID();
    const newMachine = {
      machine_id: machineId,
      ...machine,
      created_at: new Date().toISOString(),
    };
    machines.push(newMachine);
    saveToStorage("machines", machines);
    return { machine: newMachine };
  },

  update: (id: string, machineData: any) => {
    const machines = getFromStorage("machines");
    const index = machines.findIndex((m: any) => m.machine_id === id);
    
    if (index === -1) {
      throw new Error("Machine not found");
    }
    
    machines[index] = { ...machines[index], ...machineData };
    saveToStorage("machines", machines);
    
    return { machine: machines[index] };
  },

  delete: (id: string) => {
    const machines = getFromStorage("machines");
    const filtered = machines.filter((m: any) => m.machine_id !== id);
    saveToStorage("machines", filtered);
    return { message: "Machine deleted successfully" };
  },
};

// Maintenance API
export const localMaintenanceAPI = {
  getAll: () => {
    const records = getFromStorage("maintenance");
    return { records };
  },

  create: (record: any) => {
    const records = getFromStorage("maintenance");
    const maintenanceId = crypto.randomUUID();
    const newRecord = {
      maintenance_id: maintenanceId,
      ...record,
      created_at: new Date().toISOString(),
    };
    records.push(newRecord);
    saveToStorage("maintenance", records);
    return { record: newRecord };
  },

  update: (id: string, recordData: any) => {
    const records = getFromStorage("maintenance");
    const index = records.findIndex((r: any) => r.maintenance_id === id);
    
    if (index === -1) {
      throw new Error("Maintenance record not found");
    }
    
    records[index] = { ...records[index], ...recordData };
    saveToStorage("maintenance", records);
    
    return { record: records[index] };
  },

  delete: (id: string) => {
    const records = getFromStorage("maintenance");
    const filtered = records.filter((r: any) => r.maintenance_id !== id);
    saveToStorage("maintenance", filtered);
    return { message: "Maintenance record deleted successfully" };
  },
};

// Schedules API
export const localSchedulesAPI = {
  getAll: () => {
    const schedules = getFromStorage("schedules");
    return { schedules };
  },

  create: (schedule: any) => {
    const schedules = getFromStorage("schedules");
    const scheduleId = crypto.randomUUID();
    const newSchedule = {
      schedule_id: scheduleId,
      ...schedule,
      status: "Pending",
      created_at: new Date().toISOString(),
    };
    schedules.push(newSchedule);
    saveToStorage("schedules", schedules);
    return { schedule: newSchedule };
  },

  update: (id: string, scheduleData: any) => {
    const schedules = getFromStorage("schedules");
    const index = schedules.findIndex((s: any) => s.schedule_id === id);
    
    if (index === -1) {
      throw new Error("Schedule not found");
    }
    
    schedules[index] = { ...schedules[index], ...scheduleData };
    saveToStorage("schedules", schedules);
    
    return { schedule: schedules[index] };
  },

  delete: (id: string) => {
    const schedules = getFromStorage("schedules");
    const filtered = schedules.filter((s: any) => s.schedule_id !== id);
    saveToStorage("schedules", filtered);
    return { message: "Schedule deleted successfully" };
  },
};