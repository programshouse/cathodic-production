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
  MdWifiTethering,         // Interference
  MdScience,               // Soil Resistivity
  MdSolarPower,            // Solar Sizing
  MdGridOn,                // Surface Area
  MdBlurCircular,          // Tank MMO Ribbon
  MdTune,                  // Variable/Shunt Sizing
  MdShowChart,             // Voltage Gradient
  MdPowerSettingsNew       // Rectifier Ratings
} from "react-icons/md";
import { ChevronDownIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

const navItems = [
  { name: "Attenuation & Pipeline Potential profile", icon: <MdTimeline />,            path: "/pages/attenuation-profile" },
  { name: "Barnes Layer Resistivity",                 icon: <MdLayers />,             path: "/pages/barnes-layer-resistivity" },
  { name: "Circuit Resistance Module",                icon: <MdCable />,              path: "/pages/circuit-resistance" },
  { name: "Coating Factors Calculation",              icon: <MdFormatPaint />,        path: "/pages/coating-factors" },
  { name: "Current Density Calculation",              icon: <MdWaterDrop />,          path: "/pages/current-density" },
  { name: "Galvanic Anode System Calculation",        icon: <MdBatteryChargingFull />,path: "/pages/galvanic-anode" },
  { name: "Groundbed Resistance",                     icon: <MdLandscape />,          path: "/pages/groundbed-resistance" },
  { name: "Impressed Current System Calculation",     icon: <MdBolt />,               path: "/pages/impressed-current" },
  { name: "Interference Calculation",                 icon: <MdWifiTethering />,      path: "/pages/interference" },
  { name: "Rectifier Ratings",                        icon: <MdPowerSettingsNew />,   path: "/pages/rectifier-ratings" },
  { name: "Soil Resistivity",                         icon: <MdScience />,            path: "/pages/soil-resistivity" },
  { name: "Solar Sizing",                             icon: <MdSolarPower />,         path: "/pages/solar-sizing" },
  { name: "Surface Area Calculation",                 icon: <MdGridOn />,             path: "/surface-area" },
  { name: "Tank MMO Anode Sizing",                    icon: <MdBlurCircular />,       path: "/pages/tank-mmo-sizing" },
  { name: "Variable Resistor & Shunt Resistor Sizing",icon: <MdTune />,               path: "/pages/variable-shunt-sizing" },
  { name: "Voltage Gradient",                         icon: <MdShowChart />,          path: "/pages/voltage-gradient" },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  function getSortedNavItems(items) {
    return [...items].sort((a, b) =>
      (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
    );
  }

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
    setOpenSubmenu((prev) => (prev && prev.index === index ? null : { index }));
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
      <div className="flex py-8 lg:justify-center">
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden rounded-full"
                src="/images/logo/logoos.jpg"
                alt="logoos"
                width={100}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images1/logo/logoos-dark.svg"
                alt="logoos"
                width={100}
                height={30}
              />
            </>
          ) : (
            <img
              src="/images/logo/logoos.jpg"
              alt="logoos"
              width={150}
              height={120}
            />
          )}
        </Link>
      </div>

      <nav className="no-scrollbar flex flex-col overflow-y-auto pb-6 duration-300 ease-linear">
        <ul className="flex flex-col gap-4">
          {getSortedNavItems(navItems).map((nav, index) => (
            <li key={`${nav.name}-${nav.path}`}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`${baseItem} ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
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
                      !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
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

        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </nav>
    </aside>
  );
};

export default AppSidebar;
