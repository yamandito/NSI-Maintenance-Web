import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { machinesAPI } from "../lib/api";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { ImageUpload } from "../components/ImageUpload";

export default function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);
  const [formData, setFormData] = useState({
    machine_name: "",
    category: "",
    location: "",
    status: "Operational",
    runtime_hours: "0",
    image: null,
  });

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      const response = await machinesAPI.getAll();
      setMachines(response.machines || []);
    } catch (error: any) {
      console.error("Error loading machines:", error);
      toast.error("Gagal memuat data mesin");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await machinesAPI.update(editingMachine.machine_id, {
          ...formData,
          runtime_hours: parseInt(formData.runtime_hours),
        });
        toast.success("Mesin berhasil diupdate");
      } else {
        await machinesAPI.create({
          ...formData,
          runtime_hours: parseInt(formData.runtime_hours),
        });
        toast.success("Mesin berhasil ditambahkan");
      }
      setDialogOpen(false);
      resetForm();
      loadMachines();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan mesin");
    }
  };

  const handleEdit = (machine: any) => {
    setEditingMachine(machine);
    setFormData({
      machine_name: machine.machine_name,
      category: machine.category,
      location: machine.location,
      status: machine.status,
      runtime_hours: machine.runtime_hours.toString(),
      image: machine.image,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mesin ini?")) return;
    try {
      await machinesAPI.delete(id);
      toast.success("Mesin berhasil dihapus");
      loadMachines();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus mesin");
    }
  };

  const resetForm = () => {
    setEditingMachine(null);
    setFormData({
      machine_name: "",
      category: "",
      location: "",
      status: "Operational",
      runtime_hours: "0",
      image: null,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      Operational: "default",
      Maintenance: "secondary",
      Down: "destructive",
    };
    const colors: any = {
      Operational: "bg-success text-success-foreground",
      Maintenance: "bg-warning text-warning-foreground",
      Down: "bg-destructive text-destructive-foreground",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold">Manajemen Mesin</h2>
          <p className="text-sm text-muted-foreground">Kelola data mesin produksi garmen</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Mesin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>{editingMachine ? "Edit Mesin" : "Tambah Mesin Baru"}</DialogTitle>
              <DialogDescription>
                {editingMachine ? "Update informasi mesin" : "Masukkan data mesin baru"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="machine_name">Nama Mesin</Label>
                <Input
                  id="machine_name"
                  value={formData.machine_name}
                  onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                  required
                  placeholder="e.g., Sewing Machine #1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sewing">Sewing (Jahit)</SelectItem>
                    <SelectItem value="Cutting">Cutting (Potong)</SelectItem>
                    <SelectItem value="Finishing">Finishing</SelectItem>
                    <SelectItem value="Pressing">Pressing (Setrika)</SelectItem>
                    <SelectItem value="Embroidery">Embroidery (Bordir)</SelectItem>
                    <SelectItem value="Knitting">Knitting (Rajut)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g., Production Floor A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Down">Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="runtime_hours">Runtime Hours</Label>
                <Input
                  id="runtime_hours"
                  type="number"
                  value={formData.runtime_hours}
                  onChange={(e) => setFormData({ ...formData, runtime_hours: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Gambar Mesin</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingMachine ? "Update" : "Tambah"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Daftar Mesin</CardTitle>
        </CardHeader>
        <CardContent>
          {machines.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data mesin</p>
              <p className="text-sm text-muted-foreground">Klik tombol "Tambah Mesin" untuk menambah data</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Mesin</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Runtime (Jam)</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machines.map((machine) => (
                      <TableRow key={machine.machine_id}>
                        <TableCell className="font-medium">{machine.machine_name}</TableCell>
                        <TableCell>{machine.category}</TableCell>
                        <TableCell>{machine.location}</TableCell>
                        <TableCell>{getStatusBadge(machine.status)}</TableCell>
                        <TableCell>{machine.runtime_hours.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(machine)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(machine.machine_id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {machines.map((machine) => (
                  <Card key={machine.machine_id} className="border shadow-sm">
                    <CardContent className="p-4">
                      {machine.image && (
                        <div className="mb-3">
                          <img
                            src={machine.image}
                            alt={machine.machine_name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{machine.machine_name}</h3>
                          <p className="text-sm text-muted-foreground">{machine.category}</p>
                        </div>
                        {getStatusBadge(machine.status)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lokasi:</span>
                          <span className="font-medium">{machine.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Runtime:</span>
                          <span className="font-medium">{machine.runtime_hours.toLocaleString()} jam</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(machine)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(machine.machine_id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}