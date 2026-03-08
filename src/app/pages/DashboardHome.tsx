import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { machinesAPI, maintenanceAPI, schedulesAPI } from "../lib/api";
import { Settings, Wrench, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";

export default function DashboardHome() {
  const [machines, setMachines] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [machinesRes, maintenanceRes, schedulesRes] = await Promise.all([
        machinesAPI.getAll(),
        maintenanceAPI.getAll(),
        schedulesAPI.getAll(),
      ]);
      setMachines(machinesRes.machines || []);
      setMaintenanceRecords(maintenanceRes.records || []);
      setSchedules(schedulesRes.schedules || []);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalMachines: machines.length,
    runningMachines: machines.filter((m) => m.status === "Operational").length,
    maintenanceMachines: machines.filter((m) => m.status === "Maintenance").length,
    idleMachines: machines.filter((m) => m.status === "Down").length,
  };

  // Chart data
  const statusData = [
    { name: "Operational", value: stats.runningMachines },
    { name: "Maintenance", value: stats.maintenanceMachines },
    { name: "Down", value: stats.idleMachines },
  ];

  const maintenanceTypeData = [
    { name: "Preventive", count: maintenanceRecords.filter((r) => r.maintenance_type === "preventive").length },
    { name: "Corrective", count: maintenanceRecords.filter((r) => r.maintenance_type === "corrective").length },
    { name: "Breakdown", count: maintenanceRecords.filter((r) => r.maintenance_type === "breakdown").length },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  const upcomingSchedules = schedules
    .filter((s) => s.status === "Pending")
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="shadow-md border-l-4 border-l-primary">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">Total Machines</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mt-1 lg:mt-2">{stats.totalMachines}</h3>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-success">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">Running</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-success mt-1 lg:mt-2">{stats.runningMachines}</h3>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-warning">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">Under Maintenance</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-warning mt-1 lg:mt-2">{stats.maintenanceMachines}</h3>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-destructive">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">Idle</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-destructive mt-1 lg:mt-2">{stats.idleMachines}</h3>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Machine Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Maintenance Types (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={maintenanceTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Maintenance */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Recent Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 lg:space-y-4">
            {maintenanceRecords.slice(0, 5).map((record: any) => {
              const machine = machines.find((m) => m.machine_id === record.machine_id);
              return (
                <div
                  key={record.maintenance_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 lg:p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm lg:text-base text-foreground truncate">
                        {machine?.machine_name || "Unknown Machine"}
                      </p>
                      <p className="text-xs lg:text-sm text-muted-foreground capitalize">{record.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 pl-11 sm:pl-0">
                    <span
                      className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === "Completed"
                          ? "bg-success/10 text-success"
                          : record.status === "In Progress"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {record.status}
                    </span>
                    <span className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(record.scheduled_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}