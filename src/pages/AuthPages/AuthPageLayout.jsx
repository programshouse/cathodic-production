import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center lg:flex-row dark:bg-gray-900 sm:p-0">
        {/* LEFT: Logo + Form */}
        <div className="flex w-full flex-col items-center justify-center lg:w-1/2">
          <div className="mx-auto w-full max-w-md px-4 sm:px-6">
            {/* Old logo on top of form */}
            <Link to="/" className="mb-3 block text-center">
              <img
                width={350}
                height={80}
                src="/images/logo/logoos.jpg"
                style={{ borderRadius: "50%", objectFit: "cover" }}
                alt="logoos"
              />
            </Link>

            {/* Form content */}
            <div>{children}</div>
          </div>
        </div>

        {/* RIGHT: Illustration with personal logo */}
        <div className="hidden h-full w-full items-center bg-brand-950 lg:grid lg:w-1/2 dark:bg-white/5">
          <div className="relative z-1 flex items-center justify-center">
            <GridShape />
            <div className="flex max-w-sm flex-col items-center">
              <Link to="/" className="mb-4 block">
                <img
                  width={460}
                  height={130}
                  src="/images/logo/personallogo.png"
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                  alt="personal logo"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
