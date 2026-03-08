import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import MachinesPage from "./pages/MachinesPage";
import MaintenancePage from "./pages/MaintenancePage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "machines", Component: MachinesPage },
      { path: "maintenance", Component: MaintenancePage },
      { path: "users", Component: UsersPage },
      { path: "settings", Component: SettingsPage },
      { path: "reports", Component: ReportsPage },
    ],
  },
]);
