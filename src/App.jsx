import React, { useEffect } from "react";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "./stores/useAuthStore";
import SignIn from "./pages/AuthPages/Signin";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Card from "./components/ui/card.jsx";

import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import HistoryPage from "./pages/History/HistoryPage";
import LibPage from "./pages/Lib/LibPage";
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


// GuestOnlyRoute: only guests (not logged-in)
const GuestOnlyRoute = ({ children }) => {
  const { access_token } = useAuthStore();
  return !access_token ? children : <Navigate to="/" replace />;
};

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
          { path: "/pages/lib", element: <LibPage /> },
          // Legacy redirects
          { path: "/surface-area", element: <Navigate to="/pages/surface-area" replace /> },
          { path: "/current-density", element: <Navigate to="/pages/current-density" replace /> },
          { path: "/coating-factors", element: <Navigate to="/pages/coating-factors" replace /> },
          { path: "/groundbed-resistance", element: <Navigate to="/pages/groundbed-resistance" replace /> },
          { path: "/circuit-resistance", element: <Navigate to="/pages/circuit-resistance" replace /> },
          { path: "/galvanic-anode", element: <Navigate to="/pages/galvanic-anode" replace /> },
          { path: "/impressed-current", element: <Navigate to="/pages/impressed-current" replace /> },
          { path: "/attenuation", element: <Navigate to="/pages/attenuation" replace /> },
          { path: "/voltage-gradient", element: <Navigate to="/pages/voltage-gradient" replace /> },
          { path: "/soil-resistivity", element: <Navigate to="/pages/soil-resistivity" replace /> },
          { path: "/resistor-sizing", element: <Navigate to="/pages/resistor-sizing" replace /> },
          { path: "/Variable-Resistor-Shunt", element: <Navigate to="/pages/Variable-Resistor-Shunt" replace /> },
          { path: "/history", element: <Navigate to="/pages/history" replace /> },
          { path: "/pages/Lib", element: <Navigate to="/pages/lib" replace /> },
          { path: "/lib", element: <Navigate to="/pages/lib" replace /> },
// real route
{ path: "/pages/booking", element: <FreeConsultation /> },

// helpful aliases
{ path: "/booking", element: <Navigate to="/pages/booking" replace /> },
{ path: "/pages/Booking", element: <Navigate to="/pages/booking" replace /> },
{ path: "/free-consultation", element: <Navigate to="/pages/booking" replace /> },
{ path: "/pages/free-consultation", element: <Navigate to="/pages/booking" replace /> },

// remove/replace this old line (it pointed to a non-existent route):
// { path: "/FreeConsultation", element: <Navigate to="/pages/FreeConsultation" replace /> },

        ],
  },
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
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  const { checkSession, loadUserFromStorage, isInitialized } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
    checkSession();
    const interval = setInterval(() => {
      checkSession();
    },24* 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSession, loadUserFromStorage]);

  if (!isInitialized) {
    return <div>Loading...</div>; 
  }
  return <RouterProvider router={router} />;
}
