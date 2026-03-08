import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "../components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola preferensi aplikasi Anda</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Atur tema dan tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Mode Tema</Label>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="flex flex-col gap-2 h-auto py-4"
                onClick={() => setTheme("light")}
              >
                <Sun className="w-6 h-6" />
                <span className="text-sm">Terang</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="flex flex-col gap-2 h-auto py-4"
                onClick={() => setTheme("dark")}
              >
                <Moon className="w-6 h-6" />
                <span className="text-sm">Gelap</span>
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="flex flex-col gap-2 h-auto py-4"
                onClick={() => setTheme("system")}
              >
                <Monitor className="w-6 h-6" />
                <span className="text-sm">Sistem</span>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mode tema saat ini:{" "}
              <span className="font-medium capitalize">{theme || "system"}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
          <CardDescription>Kelola pengaturan notifikasi email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notif">Email Notifikasi</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi maintenance via email
              </p>
            </div>
            <Switch id="email-notif" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="calendar-sync">Google Calendar Sync</Label>
              <p className="text-sm text-muted-foreground">
                Sinkronkan jadwal ke Google Calendar
              </p>
            </div>
            <Switch id="calendar-sync" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reminder">Pengingat Jadwal</Label>
              <p className="text-sm text-muted-foreground">
                Pengingat 1 hari sebelum maintenance
              </p>
            </div>
            <Switch id="reminder" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tentang Sistem</CardTitle>
          <CardDescription>Informasi aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versi:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Industri:</span>
            <span className="font-medium">Manufaktur Garmen</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tahun:</span>
            <span className="font-medium">2026</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
