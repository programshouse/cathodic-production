// /src/App.jsx
import React, { useEffect } from "react";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "./stores/useAuthStore";

import SignIn from "./pages/AuthPages/Signin";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Card from "./components/ui/card.jsx";

import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import HistoryPage from "./pages/History/HistoryPage";

import LibraryBrowse from "./pages/Lib/LibraryBrowse";
import LibraryManage from "./pages/Lib/LibraryManage";
import LibraryCreate from "./pages/Lib/LibraryCreate";
import LibrarySubFoldersPage from "./pages/Lib/LibrarySubFoldersPage";
import LibraryFilesPage from "./pages/Lib/LibraryFilesPage";
import FreeConsultation from "./pages/Booking/FreeConsultation.jsx";

import Form from "./pages/Form";
import SurfaceAreaPage from "./pages/SurfaceArea/SurfaceAreaPage";
import CurrentDensityPage from "./pages/CurrentDensity/CurrentDensityPage";
import CoatingFactorsPage from "./pages/CoatingFactors/CoatingFactorsPage";
import GroundbedPage from "./pages/GroundbedResistance/GroundbedPage";
import CircuitResistancePage from "./pages/CircuitResistance/CircuitResistancePage";
import GalvanicPage from "./pages/GalvanicAnode/GalvanicPage";
import ImpressedPage from "./pages/ImpressedCurrent/ImpressedPage";
import AttenuationPage from "./pages/Attenuation/AttenuationPage";
import VoltageGradientPage from "./pages/VoltageGradient/VoltageGradientPage";
import SoilResistivityPage from "./pages/SoilResistivity/SoilResistivityPage";
import ResistorSizingPage from "./pages/ResistorSizing/ResistorSizingPage";
import InterferencePage from "./pages/Interference/InterferencePage";
import VariableResistorPage from "./pages/VariableResistor/VariableResistorPage";
import BarnesLayerPage from "./pages/BarnesLayer/BarnesLayerPage";
import SolarSizingPage from "./pages/SolarSizing/SolarSizingPage";
import TankMMOPage from "./pages/TankMMOSizing/TankMMOPage";

// 🔵 Users page (admin only)
import UsersPage from "./pages/Users/UsersPage"; // make sure this file exists

/* ---------------- Guards ---------------- */
const GuestOnlyRoute = ({ children }) => {
  const { access_token } = useAuthStore();
  return !access_token ? children : <Navigate to="/" replace />;
};

// Inline admin guard (your existing logic)
const RequireAdmin = ({ children }) => {
  const { admin, access_token, isInitialized } = useAuthStore();

  if (!isInitialized) return <div />;

  const roleStr =
    (typeof admin?.role === "string" && admin.role.toLowerCase()) ||
    (typeof admin?.type === "string" && admin.type.toLowerCase()) ||
    (typeof admin?.role_name === "string" && admin.role_name.toLowerCase());

  const rolesArr = Array.isArray(admin?.roles)
    ? admin.roles.map((r) => String(r).toLowerCase())
    : [];
  const permsArr = Array.isArray(admin?.permissions)
    ? admin.permissions.map((p) => String(p).toLowerCase())
    : [];

  const isAdmin =
    admin?.is_admin === true ||
    roleStr === "admin" ||
    rolesArr.includes("admin") ||
    permsArr.includes("admin") ||
    permsArr.includes("manage_library") ||
    permsArr.includes("library:manage");

  return access_token && isAdmin ? children : <Navigate to="/library" replace />;
};

/* ---------------- Router ---------------- */
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },

      { path: "/form", element: <Form /> },
      { path: "/card", element: <Card /> },

      // Canonical: /pages/...
      { path: "/pages/surface-area", element: <SurfaceAreaPage /> },
      { path: "/pages/current-density", element: <CurrentDensityPage /> },
      { path: "/pages/coating-factors", element: <CoatingFactorsPage /> },
      { path: "/pages/groundbed-resistance", element: <GroundbedPage /> },
      { path: "/pages/circuit-resistance", element: <CircuitResistancePage /> },
      { path: "/pages/galvanic-anode", element: <GalvanicPage /> },
      { path: "/pages/impressed-current", element: <ImpressedPage /> },
      { path: "/pages/interference", element: <InterferencePage /> },
      { path: "/pages/attenuation", element: <AttenuationPage /> },
      { path: "/pages/voltage-gradient", element: <VoltageGradientPage /> },
      { path: "/pages/soil-resistivity", element: <SoilResistivityPage /> },
      { path: "/pages/solar-sizing", element: <SolarSizingPage /> },
      { path: "/pages/tank-mmo-sizing", element: <TankMMOPage /> },
      { path: "/pages/resistor-sizing", element: <VariableResistorPage /> },
      { path: "/pages/Variable-Resistor-Shunt", element: <ResistorSizingPage /> },
      { path: "/pages/variable-resistor-shunt", element: <Navigate to="/pages/Variable-Resistor-Shunt" replace /> },
      { path: "/pages/barnes-layer", element: <BarnesLayerPage /> },
      { path: "/pages/history", element: <HistoryPage /> },

      // 🔵 Admin-only Users
      {
        path: "/pages/users",
        element: (
          <RequireAdmin>
            <UsersPage />
          </RequireAdmin>
        ),
      },

      /* ===== Library ===== */
      { path: "/library", element: <LibraryBrowse /> }, // folders list (everyone)
      { path: "/library/folder/:folderId", element: <LibrarySubFoldersPage /> },
      {
        path: "/library/folder/:folderId/subfolder/:subFolderId",
        element: <LibraryFilesPage />,
      },
      {
        path: "/admin/library",
        element: (
          <RequireAdmin>
            <LibraryManage />
          </RequireAdmin>
        ),
      },
      {
        path: "/admin/library/create",
        element: (
          <RequireAdmin>
            <LibraryCreate />
          </RequireAdmin>
        ),
      },

      /* ===== Legacy redirects ===== */
      { path: "/pages/lib", element: <Navigate to="/library" replace /> },
      { path: "/pages/Lib", element: <Navigate to="/library" replace /> },
      { path: "/lib", element: <Navigate to="/library" replace /> },

      /* ===== Booking ===== */
      { path: "/pages/booking", element: <FreeConsultation /> },
      { path: "/booking", element: <Navigate to="/pages/booking" replace /> },
      { path: "/pages/Booking", element: <Navigate to="/pages/booking" replace /> },
      { path: "/free-consultation", element: <Navigate to="/pages/booking" replace /> },
      { path: "/pages/free-consultation", element: <Navigate to="/pages/booking" replace /> },
    ],
  },

  // Auth
  {
    path: "signin",
    element: (
      <GuestOnlyRoute>
        <SignIn />
      </GuestOnlyRoute>
    ),
  },
  {
    path: "signup",
    element: (
      <GuestOnlyRoute>
        <SignUp />
      </GuestOnlyRoute>
    ),
  },

  // 404
  { path: "*", element: <NotFound /> },
]);

export default function App() {
  const { checkSession, loadUserFromStorage, isInitialized } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
    checkSession();
    const interval = setInterval(() => {
      checkSession();
    }, 24 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSession, loadUserFromStorage]);

  if (!isInitialized) return <div>Loading...</div>;
  return <RouterProvider router={router} />;
}
