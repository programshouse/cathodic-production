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
import Form from "./pages/Form";
import SurfaceAreaPage from "./pages/SurfaceArea/SurfaceAreaPage";
import CurrentDensityPage from "./pages/CurrentDensity/CurrentDensityPage";
import CoatingFactorsPage from "./pages/CoatingFactors/CoatingFactorsPage";


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
          // Legacy redirects
          { path: "/surface-area", element: <Navigate to="/pages/surface-area" replace /> },
          { path: "/current-density", element: <Navigate to="/pages/current-density" replace /> },
          { path: "/coating-factors", element: <Navigate to="/pages/coating-factors" replace /> },
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
