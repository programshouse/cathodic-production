import React from "react";

export default function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-medium px-5 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
