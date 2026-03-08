import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { authAPI, setAuthData, isUsingLocalStorage } from "../lib/api";
import { Settings, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { seedInitialData } from "../lib/seed-data";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      setAuthData(response.token, response.user);
      toast.success("Login berhasil!");
      navigate("/");
    } catch (err: any) {
      const errorMsg = err.message || "Login gagal";
      
      // If invalid credentials and trying to login as admin, suggest seeding data
      if (errorMsg.includes("Invalid credentials") && email === "admin@garmen.com") {
        setError("Admin belum terdaftar. Klik tombol 'Buat Data Demo' di bawah untuk membuat data awal.");
        toast.error("Klik tombol 'Buat Data Demo' terlebih dahulu");
      } else if (errorMsg.includes("Failed to fetch") || errorMsg.includes("Network request failed")) {
        setError("Server belum siap. Tunggu beberapa detik dan coba lagi, atau klik 'Buat Data Demo'.");
        toast.error("Koneksi ke server gagal. Coba lagi sebentar.");
      } else {
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setError("");
    try {
      await seedInitialData();
      toast.success("Data demo berhasil dibuat! Login dengan admin@garmen.com / admin123");
      setEmail("admin@garmen.com");
      setPassword("admin123");
    } catch (error: any) {
      const errorMessage = error.message || "Gagal membuat data demo";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Seed data error:", error);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-primary mb-4">
            <Settings className="w-8 h-8 lg:w-10 lg:h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">ERP Maintenance</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-2">Sistem Monitoring Permesinan Garmen</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg lg:text-xl">Login</CardTitle>
            <CardDescription className="text-sm">Masukkan email dan password Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-xs lg:text-sm">{error}</span>
                </div>
              )}

              {/* Informational box */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-primary text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-xs lg:text-sm">Pertama kali menggunakan?</p>
                  <p className="text-xs mt-1">Klik tombol "Buat Data Demo" di bawah untuk membuat akun admin dan data sample.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm lg:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@garmen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm lg:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm lg:text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-sm lg:text-base"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </Button>

              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-sm lg:text-base"
                  onClick={handleSeedData}
                  disabled={seeding}
                >
                  {seeding ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Membuat data demo...
                    </span>
                  ) : (
                    <span>🎯 Buat Data Demo</span>
                  )}
                </Button>
                <div className="mt-3 p-2 rounded bg-muted/50 text-center">
                  <p className="text-xs font-medium text-foreground">
                    Login Demo: admin@garmen.com / admin123
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Klik tombol di atas untuk membuat data
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs lg:text-sm text-muted-foreground mt-6">
          © 2024 ERP Maintenance System. Industri Garmen.
        </p>
      </div>
    </div>
  );
}