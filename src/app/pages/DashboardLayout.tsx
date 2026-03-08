import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { getCurrentUser, clearAuthData, isUsingLocalStorage } from "../lib/api";
import { Button } from "../components/ui/button";
import { Settings, LogOut, LayoutDashboard, Wrench, Users, FileText, Menu, X, Database, Cloud } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "../components/ui/sonner";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const usingLocalStorage = isUsingLocalStorage();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthData();
    navigate("/login");
  };

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/machines", icon: Settings, label: "Machines" },
    { path: "/maintenance", icon: Wrench, label: "Maintenance" },
    ...(user?.role === "admin" ? [{ path: "/users", icon: Users, label: "Users" }] : []),
    { path: "/reports", icon: FileText, label: "Reports" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  if (!user) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen flex bg-background relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky top-0 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 flex flex-col border-r border-sidebar-border z-30 lg:z-0`}
        >
          <div className="p-4 lg:p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-base lg:text-lg">ERP Maintenance</h2>
                <p className="text-xs text-sidebar-foreground/60">Industri Garmen</p>
              </div>
            </div>
          </div>

          <div className="p-3 lg:p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 rounded-lg bg-sidebar-accent/50">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold text-xs lg:text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 lg:p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm lg:text-base text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
          {/* Top Header */}
          <header className="bg-card border-b border-border px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 lg:gap-4 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:flex shrink-0"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="min-w-0">
                  <h1 className="text-lg lg:text-2xl font-bold text-foreground truncate">
                    {menuItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
                  </h1>
                  <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                    Sistem Monitoring Maintenance Permesinan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {usingLocalStorage ? (
                  <div className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">
                    <Database className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
                    <Cloud className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    <span className="hidden sm:inline">Online</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}