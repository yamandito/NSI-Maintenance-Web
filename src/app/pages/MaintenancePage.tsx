import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Calendar } from "../components/ui/calendar";
import { machinesAPI, maintenanceAPI, schedulesAPI, getCurrentUser } from "../lib/api";
import { Plus, Edit, Trash2, Filter, Calendar as CalendarIcon, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { ImageUpload } from "../components/ImageUpload";

export default function MaintenancePage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [filterMachine, setFilterMachine] = useState("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewImageDialog, setViewImageDialog] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const [recordForm, setRecordForm] = useState({
    machine_id: "",
    type: "Preventive",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    status: "Scheduled",
    damage_image: null,
  });

  const [scheduleForm, setScheduleForm] = useState({
    machine_id: "",
    scheduled_date: new Date().toISOString().split("T")[0],
    type: "Preventive",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [machinesRes, recordsRes, schedulesRes] = await Promise.all([
        machinesAPI.getAll(),
        maintenanceAPI.getAll(),
        schedulesAPI.getAll(),
      ]);
      setMachines(machinesRes.machines || []);
      setRecords(recordsRes.records || []);
      setSchedules(schedulesRes.schedules || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentUser = getCurrentUser();
      const payload = {
        ...recordForm,
        maintenance_type: recordForm.type.toLowerCase(),
        scheduled_date: recordForm.date,
        technician_id: currentUser?.user_id,
      };

      if (editingRecord) {
        await maintenanceAPI.update(editingRecord.maintenance_id, payload);
        toast.success("Record berhasil diupdate");
      } else {
        await maintenanceAPI.create(payload);
        toast.success("Record berhasil ditambahkan");
      }
      setRecordDialogOpen(false);
      resetRecordForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan record");
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentUser = getCurrentUser();
      const payload = {
        ...scheduleForm,
        maintenance_type: scheduleForm.type.toLowerCase(),
        technician_id: currentUser?.user_id,
      };

      if (editingSchedule) {
        await schedulesAPI.update(editingSchedule.schedule_id, payload);
        toast.success("Schedule berhasil diupdate");
      } else {
        await schedulesAPI.create(payload);
        toast.success("Schedule berhasil ditambahkan");
      }
      setScheduleDialogOpen(false);
      resetScheduleForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan schedule");
    }
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    setRecordForm({
      machine_id: record.machine_id,
      type: record.maintenance_type.charAt(0).toUpperCase() + record.maintenance_type.slice(1),
      date: record.scheduled_date,
      notes: record.notes || "",
      status: record.status,
      damage_image: record.damage_image || null,
    });
    setRecordDialogOpen(true);
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      machine_id: schedule.machine_id,
      scheduled_date: schedule.scheduled_date,
      type: schedule.maintenance_type.charAt(0).toUpperCase() + schedule.maintenance_type.slice(1),
      notes: schedule.notes || "",
    });
    setScheduleDialogOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus record ini?")) return;
    try {
      await maintenanceAPI.delete(id);
      toast.success("Record berhasil dihapus");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus record");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus schedule ini?")) return;
    try {
      await schedulesAPI.delete(id);
      toast.success("Schedule berhasil dihapus");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus schedule");
    }
  };

  const resetRecordForm = () => {
    setEditingRecord(null);
    setRecordForm({
      machine_id: "",
      type: "Preventive",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      status: "Scheduled",
      damage_image: null,
    });
  };

  const resetScheduleForm = () => {
    setEditingSchedule(null);
    setScheduleForm({
      machine_id: "",
      scheduled_date: new Date().toISOString().split("T")[0],
      type: "Preventive",
      notes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      Completed: "bg-success text-success-foreground",
      "In Progress": "bg-warning text-warning-foreground",
      Scheduled: "bg-primary text-primary-foreground",
      Pending: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const filteredRecords = records.filter((record) => {
    if (filterMachine !== "all" && record.machine_id !== filterMachine) return false;
    if (filterDate && record.scheduled_date !== format(filterDate, "yyyy-MM-dd")) return false;
    return true;
  });

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="records">Maintenance Records</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Maintenance Records</h2>
              <p className="text-sm text-muted-foreground">Kelola record maintenance mesin</p>
            </div>
            <Dialog open={recordDialogOpen} onOpenChange={(open) => {
              setRecordDialogOpen(open);
              if (!open) resetRecordForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? "Edit Record" : "Tambah Record Baru"}</DialogTitle>
                  <DialogDescription>
                    {editingRecord ? "Update informasi maintenance" : "Masukkan data maintenance baru"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRecordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="machine_id">Mesin</Label>
                    <Select
                      value={recordForm.machine_id}
                      onValueChange={(value) => setRecordForm({ ...recordForm, machine_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mesin" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((machine) => (
                          <SelectItem key={machine.machine_id} value={machine.machine_id}>
                            {machine.machine_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe Maintenance</Label>
                    <Select
                      value={recordForm.type}
                      onValueChange={(value) => setRecordForm({ ...recordForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventive">Preventive</SelectItem>
                        <SelectItem value="Corrective">Corrective</SelectItem>
                        <SelectItem value="Breakdown">Breakdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={recordForm.date}
                      onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={recordForm.status}
                      onValueChange={(value) => setRecordForm({ ...recordForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={recordForm.notes}
                      onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                      placeholder="Deskripsi kerusakan atau pekerjaan..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="damage_image">Foto Kerusakan</Label>
                    <ImageUpload
                      value={recordForm.damage_image}
                      onChange={(value) => setRecordForm({ ...recordForm, damage_image: value })}
                      label=""
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingRecord ? "Update" : "Tambah"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRecordDialogOpen(false);
                        resetRecordForm();
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="filter_machine" className="text-xs">Filter Mesin</Label>
                  <Select value={filterMachine} onValueChange={setFilterMachine}>
                    <SelectTrigger id="filter_machine">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Mesin</SelectItem>
                      {machines.map((machine) => (
                        <SelectItem key={machine.machine_id} value={machine.machine_id}>
                          {machine.machine_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="filter_date" className="text-xs">Filter Tanggal</Label>
                  <Input
                    id="filter_date"
                    type="date"
                    value={filterDate ? format(filterDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => setFilterDate(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterMachine("all");
                      setFilterDate(undefined);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Daftar Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Belum ada data maintenance</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mesin</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Foto</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((record) => {
                          const machine = machines.find((m) => m.machine_id === record.machine_id);
                          return (
                            <TableRow key={record.maintenance_id}>
                              <TableCell className="font-medium">{machine?.machine_name || "Unknown"}</TableCell>
                              <TableCell className="capitalize">{record.maintenance_type}</TableCell>
                              <TableCell>{new Date(record.scheduled_date).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(record.status)}</TableCell>
                              <TableCell>
                                {record.damage_image ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setViewingImage(record.damage_image);
                                      setViewImageDialog(true);
                                    }}
                                  >
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRecord(record.maintenance_id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {filteredRecords.map((record) => {
                      const machine = machines.find((m) => m.machine_id === record.machine_id);
                      return (
                        <Card key={record.maintenance_id} className="border shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base truncate">{machine?.machine_name || "Unknown"}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{record.maintenance_type}</p>
                              </div>
                              {getStatusBadge(record.status)}
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tanggal:</span>
                                <span className="font-medium">{new Date(record.scheduled_date).toLocaleDateString()}</span>
                              </div>
                              {record.notes && (
                                <div>
                                  <span className="text-muted-foreground">Catatan:</span>
                                  <p className="text-xs mt-1">{record.notes}</p>
                                </div>
                              )}
                              {record.damage_image && (
                                <div className="pt-2">
                                  <img
                                    src={record.damage_image}
                                    alt="Damage"
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                    onClick={() => {
                                      setViewingImage(record.damage_image);
                                      setViewImageDialog(true);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-4 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEditRecord(record)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteRecord(record.maintenance_id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Kalender Maintenance</h2>
              <p className="text-sm text-muted-foreground">Jadwalkan maintenance preventive</p>
            </div>
            <Dialog open={scheduleDialogOpen} onOpenChange={(open) => {
              setScheduleDialogOpen(open);
              if (!open) resetScheduleForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>{editingSchedule ? "Edit Schedule" : "Tambah Schedule Baru"}</DialogTitle>
                  <DialogDescription>
                    {editingSchedule ? "Update schedule maintenance" : "Buat schedule maintenance baru"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule_machine">Mesin</Label>
                    <Select
                      value={scheduleForm.machine_id}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, machine_id: value })}
                    >
                      <SelectTrigger id="schedule_machine">
                        <SelectValue placeholder="Pilih mesin" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((machine) => (
                          <SelectItem key={machine.machine_id} value={machine.machine_id}>
                            {machine.machine_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule_type">Tipe</Label>
                    <Select
                      value={scheduleForm.type}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, type: value })}
                    >
                      <SelectTrigger id="schedule_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventive">Preventive</SelectItem>
                        <SelectItem value="Corrective">Corrective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule_date">Tanggal</Label>
                    <Input
                      id="schedule_date"
                      type="date"
                      value={scheduleForm.scheduled_date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule_notes">Catatan</Label>
                    <Textarea
                      id="schedule_notes"
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                      placeholder="Deskripsi pekerjaan..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingSchedule ? "Update" : "Tambah"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setScheduleDialogOpen(false);
                        resetScheduleForm();
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Schedule - {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Pilih tanggal"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedules
                    .filter((s) => s.scheduled_date === (selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""))
                    .map((schedule) => {
                      const machine = machines.find((m) => m.machine_id === schedule.machine_id);
                      return (
                        <div key={schedule.schedule_id} className="p-3 rounded-lg border bg-accent/20">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm">{machine?.machine_name}</p>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{schedule.maintenance_type}</p>
                          {schedule.notes && <p className="text-xs mt-1">{schedule.notes}</p>}
                        </div>
                      );
                    })}
                  {schedules.filter((s) => s.scheduled_date === (selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""))
                    .length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada schedule</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image View Dialog */}
      <Dialog open={viewImageDialog} onOpenChange={setViewImageDialog}>
        <DialogContent className="max-w-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Foto Kerusakan</DialogTitle>
          </DialogHeader>
          {viewingImage && (
            <div className="w-full">
              <img src={viewingImage} alt="Damage" className="w-full h-auto rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
