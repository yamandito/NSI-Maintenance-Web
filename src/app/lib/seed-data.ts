import { authAPI, machinesAPI, maintenanceAPI, schedulesAPI, setAuthData, checkServerHealth, isUsingLocalStorage } from "./api";

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function seedInitialData() {
  try {
    // Check if server is healthy first
    console.log("Checking server health...");
    await checkServerHealth();
    
    if (isUsingLocalStorage()) {
      console.log("✅ Using local storage mode (offline)");
    } else {
      console.log("✅ Server is healthy");
    }

    // Check if admin already exists by trying to login
    try {
      const loginResponse = await authAPI.login("admin@garmen.com", "admin123");
      console.log("Admin user already exists");
      setAuthData(loginResponse.token, loginResponse.user);
      return true; // Data already seeded
    } catch {
      // Admin doesn't exist, proceed with seeding
      console.log("Admin user not found, creating initial data...");
    }

    // Create admin user
    console.log("Creating admin user...");
    await authAPI.register("Admin System", "admin@garmen.com", "admin123", "admin");
    console.log("✅ Admin user created");

    // Create sample operators and technicians
    console.log("Creating sample users...");
    await authAPI.register("Budi Santoso", "budi@garmen.com", "operator123", "operator");
    await authAPI.register("Siti Rahayu", "siti@garmen.com", "technician123", "technician");
    console.log("✅ Sample users created");

    // Login as admin to get token
    console.log("Logging in as admin...");
    const loginResponse = await authAPI.login("admin@garmen.com", "admin123");
    setAuthData(loginResponse.token, loginResponse.user);
    console.log("✅ Admin logged in");

    // Create sample machines
    console.log("Creating sample machines...");
    const sampleMachines = [
      { machine_name: "Sewing Machine #1", category: "Sewing", location: "Production Floor A", status: "Operational", runtime_hours: 2500, image: null },
      { machine_name: "Sewing Machine #2", category: "Sewing", location: "Production Floor A", status: "Operational", runtime_hours: 1800, image: null },
      { machine_name: "Cutting Machine #1", category: "Cutting", location: "Production Floor B", status: "Maintenance", runtime_hours: 3200, image: null },
      { machine_name: "Pressing Machine #1", category: "Pressing", location: "Finishing Area", status: "Operational", runtime_hours: 1500, image: null },
      { machine_name: "Embroidery Machine #1", category: "Embroidery", location: "Production Floor C", status: "Down", runtime_hours: 4100, image: null },
    ];

    const createdMachines = [];
    for (const machine of sampleMachines) {
      const result = await machinesAPI.create(machine);
      createdMachines.push(result.machine);
    }
    console.log("✅ Sample machines created");

    // Create sample maintenance records
    if (createdMachines.length > 0) {
      console.log("Creating sample maintenance records...");
      await maintenanceAPI.create({
        machine_id: createdMachines[0].machine_id,
        type: "Preventive",
        date: "2026-03-01",
        notes: "Routine cleaning and lubrication",
        status: "Completed",
        damage_image: null,
      });

      await maintenanceAPI.create({
        machine_id: createdMachines[2].machine_id,
        type: "Corrective",
        date: "2026-03-05",
        notes: "Replace worn cutting blade",
        status: "In Progress",
        damage_image: null,
      });

      await maintenanceAPI.create({
        machine_id: createdMachines[4].machine_id,
        type: "Breakdown",
        date: "2026-03-06",
        notes: "Motor failure - requires replacement",
        status: "Scheduled",
        damage_image: null,
      });

      console.log("✅ Sample maintenance records created");

      // Create sample schedules
      console.log("Creating sample schedules...");
      await schedulesAPI.create({
        machine_id: createdMachines[1].machine_id,
        scheduled_date: "2026-03-15",
        type: "Preventive",
        notes: "Monthly preventive maintenance",
      });

      await schedulesAPI.create({
        machine_id: createdMachines[3].machine_id,
        scheduled_date: "2026-03-20",
        type: "Preventive",
        notes: "Check heating elements and pressure",
      });

      console.log("✅ Sample schedules created");
    }

    console.log("✅ Initial data seeding completed!");
    return true;
  } catch (error: any) {
    console.error("Error seeding data:", error);
    throw error;
  }
}