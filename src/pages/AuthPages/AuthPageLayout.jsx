import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-gray-900">

      {/* LEFT SECTION */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-2">

        {/* Logo */}
        <Link to="/" className=" block text-center">
          <img
            src="/images/logo/logoos.jpg"
            alt="logo"
            className="w-[250px] h-[250px] object-cover  mx-auto"
          />
        </Link>

        {/* Form */}
        <div className="w-full max-w-md">{children}</div>
      </div>

{/* RIGHT SECTION */}
<div className="hidden lg:flex w-1/2 bg-[#071A33] relative items-center justify-center">

  
  <div className="absolute inset-0 opacity-30">
    <GridShape />
  </div>

  <div
    className="relative z-10 bg-white rounded-4xl shadow-2xl flex items-center justify-center"
    style={{ width: "650px", height: "650px" }}
  >

    <img
      src="/images/logo/image2.png"   
      alt="CP Design"
      className=" object-contain rounded-full"
    />

  </div>
</div>
    </div>
  );
}
