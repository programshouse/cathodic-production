// /src/layout/AppHeader.jsx
import React from "react";
import { Link } from "react-router-dom"; // make sure it's react-router-dom
import { FiMenu, FiX, FiPhone, FiMail } from "react-icons/fi";
import { FaLinkedinIn } from "react-icons/fa";

import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../components/header/UserDropdown";
import { useAuthStore } from "../stores/useAuthStore";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { access_token } = useAuthStore();

  const PHONES = ["+201113718843", "+9647875690176"];
  const EMAILS = ["islam.saleh30@yahoo.com", "islam.saleh3030@gmail.com"];
  const LINKEDIN = "https://www.linkedin.com/in/islam-saleh-714323aa/";

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-100/90 backdrop-blur dark:bg-slate-900/90">
      <div className="mx-auto w-full">
        <div className="mb-2 flex items-center justify-between bg-white px-4 py-8 dark:border-slate-700 dark:bg-slate-900">
          {/* LEFT: Title + (mobile) sidebar toggle */}
          <div className="flex items-center gap-3">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 lg:hidden"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                <FiX className="h-4 w-4" />
              ) : (
                <FiMenu className="h-4 w-4" />
              )}
            </button>

            <span className="text-bold font-semibold text-slate-800 dark:text-slate-100">
              Cathodic Production
            </span>
          </div>

          {/* CENTER: Contact info (desktop) */}
          <div className="hidden flex-1 items-center justify-center gap-8 text-[11px] text-slate-600 dark:text-slate-300 md:flex md:pl-10 lg:pl-20 xl:pl-28">
            {/* Phones */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center  text-amber-500">
                <FiPhone className="h-4 w-4" />
              </span>
              <div className="flex flex-col leading-tight">
                {PHONES.map((ph) => (
                  <a
                    key={ph}
                    href={`tel:${ph.replace(/[^\d+]/g, "")}`}
                    className="text-[11px] text-sky-700 hover:underline dark:text-sky-300"
                  >
                    {ph}
                  </a>
                ))}
              </div>
            </div>

            <span className="h-7 w-px bg-gray-200 dark:bg-slate-700" />

            {/* Emails */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center  text-amber-500">
                <FiMail className="h-4 w-4" />
              </span>
              <div className="flex flex-col leading-tight">
                {EMAILS.map((em) => (
                  <a
                    key={em}
                    href={`mailto:${em}`}
                    className="truncate text-[11px] text-sky-700 hover:underline dark:text-sky-300"
                  >
                    {em}
                  </a>
                ))}
              </div>
            </div>

            <span className="h-7 w-px bg-gray-200 dark:bg-slate-700" />

            {/* LinkedIn */}
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center  text-amber-500">
                <FaLinkedinIn className="h-4 w-4" />
              </span>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] font-medium text-sky-800 hover:underline dark:text-sky-300"
              >
                View Profile
              </a>
            </div>
          </div>

          {/* CENTER (mobile condensed contact) */}
          <div className="flex flex-1 items-center justify-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 md:hidden">
            <div className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center  text-amber-500">
                <FiPhone className="h-4 w-4" />
              </span>
              <a
                href={`tel:${PHONES[0].replace(/[^\d+]/g, "")}`}
                className="text-[11px] text-sky-700 hover:underline dark:text-sky-300"
              >
                {PHONES[0]}
              </a>
            </div>

            <span className="h-4 w-px bg-gray-200 dark:bg-slate-700" />

            <div className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center  text-amber-500">
                <FiMail className="h-4 w-4" />
              </span>
              <a
                href={`mailto:${EMAILS[0]}`}
                className="max-w-[130px] truncate text-[11px] text-sky-700 hover:underline dark:text-sky-300"
              >
                {EMAILS[0]}
              </a>
            </div>
          </div>

          {/* RIGHT: User / Login */}
          <div className="ml-3 flex items-center gap-2">
            {access_token ? (
              <UserDropdown />
            ) : (
              <Link
                to="/signin"
                className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-amber-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
