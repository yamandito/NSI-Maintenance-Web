import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-72f3dbef/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTHENTICATION ENDPOINTS =====

// Register new user
app.post("/make-server-72f3dbef/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return c.json({ error: "All fields are required" }, 400);
    }

    // Check if email already exists
    const existingUsers = await kv.getByPrefix("user:");
    const emailExists = existingUsers.some((user: any) => user.email === email);
    
    if (emailExists) {
      return c.json({ error: "Email already registered" }, 400);
    }

    // Create user
    const userId = crypto.randomUUID();
    const user = {
      user_id: userId,
      name,
      email,
      password, // In production, this should be hashed
      role, // admin, operator, technician
      status: "active",
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, user);

    return c.json({ 
      message: "User registered successfully",
      user: { ...user, password: undefined } // Don't return password
    }, 201);
  } catch (error) {
    console.error("Error during registration:", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// Login
app.post("/make-server-72f3dbef/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password required" }, 400);
    }

    // Find user by email
    const users = await kv.getByPrefix("user:");
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    if (user.status !== "active") {
      return c.json({ error: "Account is not active" }, 403);
    }

    // Generate simple token (in production, use proper JWT)
    const token = btoa(`${user.user_id}:${Date.now()}`);

    return c.json({
      message: "Login successful",
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Get current user from token
app.get("/make-server-72f3dbef/auth/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = atob(token);
    const userId = decoded.split(":")[0];

    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error("Error getting user:", error);
    return c.json({ error: "Unauthorized" }, 401);
  }
});

// ===== USER MANAGEMENT (ADMIN ONLY) =====

// Get all users
app.get("/make-server-72f3dbef/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    const usersWithoutPasswords = users.map((user: any) => ({ ...user, password: undefined }));
    return c.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Add user (admin)
app.post("/make-server-72f3dbef/users", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, role } = body;

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

    await kv.set(`user:${userId}`, user);
    return c.json({ user: { ...user, password: undefined } }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Update user
app.put("/make-server-72f3dbef/users/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const body = await c.req.json();

    const existingUser = await kv.get(`user:${userId}`);
    if (!existingUser) {
      return c.json({ error: "User not found" }, 404);
    }

    const updatedUser = { ...existingUser, ...body };
    await kv.set(`user:${userId}`, updatedUser);

    return c.json({ user: { ...updatedUser, password: undefined } });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Delete user
app.delete("/make-server-72f3dbef/users/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    await kv.del(`user:${userId}`);
    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// ===== MACHINES ENDPOINTS =====

// Get all machines
app.get("/make-server-72f3dbef/machines", async (c) => {
  try {
    const machines = await kv.getByPrefix("machine:");
    return c.json({ machines });
  } catch (error) {
    console.error("Error fetching machines:", error);
    return c.json({ error: "Failed to fetch machines" }, 500);
  }
});

// Add machine
app.post("/make-server-72f3dbef/machines", async (c) => {
  try {
    const body = await c.req.json();
    const { machine_name, category, location, status, runtime_hours } = body;

    const machineId = crypto.randomUUID();
    const machine = {
      machine_id: machineId,
      machine_name,
      category, // Sewing, Cutting, Finishing, Pressing, etc.
      location,
      status: status || "Operational", // Operational, Maintenance, Down
      runtime_hours: runtime_hours || 0,
      created_at: new Date().toISOString(),
    };

    await kv.set(`machine:${machineId}`, machine);
    return c.json({ machine }, 201);
  } catch (error) {
    console.error("Error creating machine:", error);
    return c.json({ error: "Failed to create machine" }, 500);
  }
});

// Update machine
app.put("/make-server-72f3dbef/machines/:id", async (c) => {
  try {
    const machineId = c.req.param("id");
    const body = await c.req.json();

    const existingMachine = await kv.get(`machine:${machineId}`);
    if (!existingMachine) {
      return c.json({ error: "Machine not found" }, 404);
    }

    const updatedMachine = { ...existingMachine, ...body };
    await kv.set(`machine:${machineId}`, updatedMachine);

    return c.json({ machine: updatedMachine });
  } catch (error) {
    console.error("Error updating machine:", error);
    return c.json({ error: "Failed to update machine" }, 500);
  }
});

// Delete machine
app.delete("/make-server-72f3dbef/machines/:id", async (c) => {
  try {
    const machineId = c.req.param("id");
    await kv.del(`machine:${machineId}`);
    return c.json({ message: "Machine deleted successfully" });
  } catch (error) {
    console.error("Error deleting machine:", error);
    return c.json({ error: "Failed to delete machine" }, 500);
  }
});

// ===== MAINTENANCE ENDPOINTS =====

// Get all maintenance records
app.get("/make-server-72f3dbef/maintenance", async (c) => {
  try {
    const records = await kv.getByPrefix("maintenance:");
    return c.json({ records });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return c.json({ error: "Failed to fetch maintenance records" }, 500);
  }
});

// Add maintenance record
app.post("/make-server-72f3dbef/maintenance", async (c) => {
  try {
    const body = await c.req.json();
    const { machine_id, type, date, technician_id, notes, status } = body;

    const maintenanceId = crypto.randomUUID();
    const record = {
      maintenance_id: maintenanceId,
      machine_id,
      type, // Preventive, Corrective, Breakdown
      date,
      technician_id,
      notes,
      status: status || "Scheduled", // Scheduled, In Progress, Completed
      created_at: new Date().toISOString(),
    };

    await kv.set(`maintenance:${maintenanceId}`, record);
    return c.json({ record }, 201);
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    return c.json({ error: "Failed to create maintenance record" }, 500);
  }
});

// Update maintenance record
app.put("/make-server-72f3dbef/maintenance/:id", async (c) => {
  try {
    const maintenanceId = c.req.param("id");
    const body = await c.req.json();

    const existingRecord = await kv.get(`maintenance:${maintenanceId}`);
    if (!existingRecord) {
      return c.json({ error: "Maintenance record not found" }, 404);
    }

    const updatedRecord = { ...existingRecord, ...body };
    await kv.set(`maintenance:${maintenanceId}`, updatedRecord);

    return c.json({ record: updatedRecord });
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    return c.json({ error: "Failed to update maintenance record" }, 500);
  }
});

// Delete maintenance record
app.delete("/make-server-72f3dbef/maintenance/:id", async (c) => {
  try {
    const maintenanceId = c.req.param("id");
    await kv.del(`maintenance:${maintenanceId}`);
    return c.json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    return c.json({ error: "Failed to delete maintenance record" }, 500);
  }
});

// ===== MAINTENANCE SCHEDULES ENDPOINTS =====

// Get all maintenance schedules
app.get("/make-server-72f3dbef/schedules", async (c) => {
  try {
    const schedules = await kv.getByPrefix("schedule:");
    return c.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return c.json({ error: "Failed to fetch schedules" }, 500);
  }
});

// Add maintenance schedule
app.post("/make-server-72f3dbef/schedules", async (c) => {
  try {
    const body = await c.req.json();
    const { machine_id, scheduled_date, type, assigned_to, notes } = body;

    const scheduleId = crypto.randomUUID();
    const schedule = {
      schedule_id: scheduleId,
      machine_id,
      scheduled_date,
      type,
      assigned_to,
      notes,
      status: "Pending", // Pending, Completed, Cancelled
      created_at: new Date().toISOString(),
    };

    await kv.set(`schedule:${scheduleId}`, schedule);
    return c.json({ schedule }, 201);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return c.json({ error: "Failed to create schedule" }, 500);
  }
});

// Update schedule
app.put("/make-server-72f3dbef/schedules/:id", async (c) => {
  try {
    const scheduleId = c.req.param("id");
    const body = await c.req.json();

    const existingSchedule = await kv.get(`schedule:${scheduleId}`);
    if (!existingSchedule) {
      return c.json({ error: "Schedule not found" }, 404);
    }

    const updatedSchedule = { ...existingSchedule, ...body };
    await kv.set(`schedule:${scheduleId}`, updatedSchedule);

    return c.json({ schedule: updatedSchedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return c.json({ error: "Failed to update schedule" }, 500);
  }
});

// Delete schedule
app.delete("/make-server-72f3dbef/schedules/:id", async (c) => {
  try {
    const scheduleId = c.req.param("id");
    await kv.del(`schedule:${scheduleId}`);
    return c.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return c.json({ error: "Failed to delete schedule" }, 500);
  }
});

Deno.serve(app.fetch);