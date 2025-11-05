import React from "react";

export default function ResetPill({ onClick, children = "Reset" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-1 rounded-full text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
    >
      {children}
    </button>
  );
}
