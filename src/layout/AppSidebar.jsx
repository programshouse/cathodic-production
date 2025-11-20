import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdTimeline,              // Attenuation
  MdLayers,                // Barnes Layer
  MdCable,                 // Circuit Resistance
  MdFormatPaint,           // Coating Factors
  MdWaterDrop,             // Current Density
  MdBatteryChargingFull,   // Galvanic Anode
  MdLandscape,             // Groundbed Resistance
  MdBolt,                  // Impressed Current
  MdScience,               // Soil Resistivity
  MdGridOn,                // Surface Area
  MdTune,                  // Variable/Shunt Sizing & Resistors
  MdShowChart,             // Voltage Gradient
  MdPeople,                // View Users (admin)
} from "react-icons/md";
import { ChevronDownIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Sidebar order EXACTLY as in the image:
 * ...
 * "View Users" is NOT in this list anymore – it is a fixed bottom item for admins.
 */
const navItems = [
  { name: "Surface Area Calculation",                 icon: <MdGridOn />,    path: "/pages/surface-area" },            // 1
  { name: "Current Density Calculation",              icon: <MdWaterDrop />, path: "/pages/current-density" },         // 2
  { name: "Coating Factors Calculation",              icon: <MdFormatPaint />, path: "/pages/coating-factors" },       // 3
  { name: "Soil Resistivity",                         icon: <MdScience />,   path: "/pages/soil-resistivity" },        // 4
  { name: "Barnes Layer Resistivity",                 icon: <MdLayers />,    path: "/pages/barnes-layer" },            // 5
  { name: "Groundbed Resistance",                     icon: <MdLandscape />, path: "/pages/groundbed-resistance" },    // 6
  { name: "Circuit Resistance Module",                icon: <MdCable />,     path: "/pages/circuit-resistance" },      // 7
  { name: "Galvanic Anode System Calculation",        icon: <MdBatteryChargingFull />, path: "/pages/galvanic-anode" },// 8
  { name: "Impressed Current System Calculation",     icon: <MdBolt />,      path: "/pages/impressed-current" },       // 9
  { name: "Resistor Sizing",                          icon: <MdTune />,      path: "/pages/Variable-Resistor-Shunt" }, // 10
  { name: "Attenuation & Pipeline Potential profile", icon: <MdTimeline />,  path: "/pages/attenuation" },             // 11
  { name: "Voltage Gradient",                         icon: <MdShowChart />, path: "/pages/voltage-gradient" },        // 12
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  // 🔴 Same admin logic as your RequireAdmin in App.jsx
  const { admin, access_token } = useAuthStore();

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
    !!access_token &&
    (admin?.is_admin === true ||
      roleStr === "admin" ||
      rolesArr.includes("admin") ||
      permsArr.includes("admin") ||
      permsArr.includes("manage_library") ||
      permsArr.includes("library:manage"));

  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prev) =>
      prev && prev.index === index ? null : { index }
    );
  };

  const baseItem =
    "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-white hover:bg-gray-200/30";
  const baseIcon = "menu-item-icon-size text-white";
  const baseText = "menu-item-text text-white";

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-brand-600 px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="flex py-8 lg:justify-center">
        <Link to="/" className="block w-full sm:w-auto">
          <div className="flex sm:justify-start justify-center">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <img
                  className="block dark:hidden rounded-full sm:mx-0 mx-auto"
                  src="/images/logo/logoos.jpg"
                  alt="logoos"
                  width={140}
                  height={50}
                />
                <img
                  className="hidden dark:block sm:mx-0 mx-auto"
                  src="/images1/logo/logoos-dark.svg"
                  alt="logoos"
                  width={100}
                  height={30}
                />
              </>
            ) : (
              <img
                className="align-middle rounded-full sm:mx-0 mx-auto"
                src="/images/logo/logoos.jpg"
                alt="logoos"
                width={150}
                height={120}
              />
            )}
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="no-scrollbar flex flex-col overflow-y-auto pb-6 duration-300 ease-linear">
        {/* Main items take available space */}
        <ul className="flex flex-col gap-4 flex-1">
          {navItems.map((nav, index) => (
            <li key={`${nav.name}-${nav.path || index}`}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`${baseItem} ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span className={baseIcon}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={baseText}>{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto h-5 w-5 transition-transform duration-200 text-white ${
                        openSubmenu?.index === index ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`${baseItem} ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "lg:justify-start"
                    } ${isActive(nav.path) ? "bg-gray-200/40" : ""}`}
                  >
                    <span className={baseIcon}>{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className={baseText}>{nav.name}</span>
                    )}
                  </Link>
                )
              )}
            </li>
          ))}
        </ul>

        {/* Fixed bottom: View Users (admin only) */}
        {isAdmin && (
          <div className="mt-4">
            <Link
              to="/pages/users"
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-2
                border border-white/40 bg-white/10
                shadow-lg shadow-black/30
                text-white
                hover:bg-white/20 hover:border-white
                transition-colors
                ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
              `}
            >
              <span className="menu-item-icon-size text-white">
                <MdPeople />
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text text-white font-semibold">
                  View Users
                </span>
              )}
            </Link>
          </div>
        )}

        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </nav>
    </aside>
  );
};

export default AppSidebar;
