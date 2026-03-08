import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { machinesAPI, maintenanceAPI, schedulesAPI } from "../lib/api";
import { FileDown, FileSpreadsheet, Calendar } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

export default function ReportsPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState("monthly");

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
      console.error("Error loading report data:", error);
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    toast.info("Fitur export PDF akan segera tersedia");
  };

  const exportToExcel = () => {
    // Create CSV content
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `maintenance_report_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Laporan berhasil diexport ke CSV");
  };

  const generateCSVReport = () => {
    let csv = "Laporan Maintenance - ERP Industri Garmen\n\n";
    
    // Summary
    csv += "RINGKASAN\n";
    csv += `Total Mesin,${machines.length}\n`;
    csv += `Mesin Operational,${machines.filter((m) => m.status === "Operational").length}\n`;
    csv += `Mesin Maintenance,${machines.filter((m) => m.status === "Maintenance").length}\n`;
    csv += `Mesin Down,${machines.filter((m) => m.status === "Down").length}\n`;
    csv += `Total Maintenance Records,${maintenanceRecords.length}\n`;
    csv += `Jadwal Pending,${schedules.filter((s) => s.status === "Pending").length}\n\n`;

    // Machines
    csv += "DAFTAR MESIN\n";
    csv += "Nama Mesin,Kategori,Lokasi,Status,Runtime Hours\n";
    machines.forEach((m) => {
      csv += `${m.machine_name},${m.category},${m.location},${m.status},${m.runtime_hours}\n`;
    });
    csv += "\n";

    // Maintenance Records
    csv += "MAINTENANCE RECORDS\n";
    csv += "Mesin,Tipe,Tanggal,Status,Catatan\n";
    maintenanceRecords.forEach((r) => {
      const machine = machines.find((m) => m.machine_id === r.machine_id);
      csv += `${machine?.machine_name || "Unknown"},${r.type},${new Date(r.date).toLocaleDateString("id-ID")},${r.status},"${r.notes || ""}"\n`;
    });
    csv += "\n";

    // Schedules
    csv += "JADWAL MAINTENANCE\n";
    csv += "Mesin,Tipe,Tanggal,Status,Catatan\n";
    schedules.forEach((s) => {
      const machine = machines.find((m) => m.machine_id === s.machine_id);
      csv += `${machine?.machine_name || "Unknown"},${s.type},${new Date(s.scheduled_date).toLocaleDateString("id-ID")},${s.status},"${s.notes || ""}"\n`;
    });

    return csv;
  };

  // Calculate monthly data for trend chart
  const getMonthlyTrend = () => {
    const monthlyData: any = {};
    maintenanceRecords.forEach((record) => {
      const month = new Date(record.date).toLocaleString("default", { month: "short" });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, Preventive: 0, Corrective: 0, Breakdown: 0 };
      }
      monthlyData[month][record.type]++;
    });
    return Object.values(monthlyData);
  };

  // Calculate maintenance by machine
  const getMaintenanceByMachine = () => {
    const machineData: any = {};
    maintenanceRecords.forEach((record) => {
      const machine = machines.find((m) => m.machine_id === record.machine_id);
      const machineName = machine?.machine_name || "Unknown";
      if (!machineData[machineName]) {
        machineData[machineName] = { name: machineName, count: 0 };
      }
      machineData[machineName].count++;
    });
    return Object.values(machineData).sort((a: any, b: any) => b.count - a.count).slice(0, 10);
  };

  const monthlyTrendData = getMonthlyTrend();
  const maintenanceByMachine = getMaintenanceByMachine();

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Laporan</h2>
          <p className="text-muted-foreground">Ringkasan dan analisis maintenance</p>
        </div>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{maintenanceRecords.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportPeriod === "monthly" ? "Bulan ini" : "Tahun ini"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preventive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {maintenanceRecords.filter((r) => r.type === "Preventive").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {maintenanceRecords.length > 0
                ? Math.round((maintenanceRecords.filter((r) => r.type === "Preventive").length / maintenanceRecords.length) * 100)
                : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Corrective
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {maintenanceRecords.filter((r) => r.type === "Corrective").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {maintenanceRecords.length > 0
                ? Math.round((maintenanceRecords.filter((r) => r.type === "Corrective").length / maintenanceRecords.length) * 100)
                : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {maintenanceRecords.filter((r) => r.type === "Breakdown").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {maintenanceRecords.length > 0
                ? Math.round((maintenanceRecords.filter((r) => r.type === "Breakdown").length / maintenanceRecords.length) * 100)
                : 0}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tren Maintenance Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Preventive" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Corrective" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="Breakdown" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Maintenance per Mesin (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceByMachine.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={maintenanceByMachine} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Summary */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Ringkasan Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Status Mesin</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Mesin:</span>
                  <span className="font-medium">{machines.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Operational:</span>
                  <span className="font-medium text-success">
                    {machines.filter((m) => m.status === "Operational").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Maintenance:</span>
                  <span className="font-medium text-warning">
                    {machines.filter((m) => m.status === "Maintenance").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Down:</span>
                  <span className="font-medium text-destructive">
                    {machines.filter((m) => m.status === "Down").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Jadwal</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Jadwal:</span>
                  <span className="font-medium">{schedules.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-medium text-warning">
                    {schedules.filter((s) => s.status === "Pending").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium text-success">
                    {schedules.filter((s) => s.status === "Completed").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cancelled:</span>
                  <span className="font-medium text-muted-foreground">
                    {schedules.filter((s) => s.status === "Cancelled").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
